/*
 *   Copyright 2026 Spicule Ltd
 *   Apache License, Version 2.0.
 */
package org.saiku.olap.util;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Proxy;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import mondrian.xmla.XmlaException;
import org.junit.Test;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

/**
 * saiku#1905 (CWE-611) reversion guard for {@link SaikuXmlaServlet#unmarshallSoapMessage}. The fork's
 * {@code DefaultXmlaServlet} parses the raw client SOAP body with an un-hardened parser (DOCTYPE +
 * external entities allowed) — a classic XXE that reads any JVM-readable file, does SSRF, or DoS via
 * entity expansion. {@code SaikuXmlaServlet} overrides the parse to route through
 * {@code SecureXml.secureDocumentBuilder()}.
 *
 * <p>The test drives the REAL sink (the overridden {@code unmarshallSoapMessage}) with a SOAP body
 * that references an external entity pointing at a secret file, and asserts the entity is NOT
 * resolved (the request is rejected, the secret never surfaces). {@link
 * #unhardenedParserWouldLeakTheFile()} proves the very same payload IS a working XXE against a plain
 * parser — so if the override is ever reverted to an un-hardened factory, {@link
 * #doctypePayloadIsRejectedNotResolved()} flips from green to red.
 */
public class SaikuXmlaServletXxeTest {

    private static final String SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/";
    private static final String SECRET = "TOP-SECRET-XXE-MARKER-1905";

    /** Minimal ServletInputStream over a byte[] — enough for {@code new InputSource(stream)}. */
    private static ServletInputStream servletInputStream(byte[] bytes) {
        final ByteArrayInputStream delegate = new ByteArrayInputStream(bytes);
        return new ServletInputStream() {
            @Override
            public int read() {
                return delegate.read();
            }

            @Override
            public boolean isFinished() {
                return delegate.available() == 0;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {}
        };
    }

    /** A dynamic-proxy HttpServletRequest that only knows how to hand back the POST body. */
    private static HttpServletRequest requestWithBody(final byte[] body) {
        return (HttpServletRequest) Proxy.newProxyInstance(
                HttpServletRequest.class.getClassLoader(),
                new Class<?>[] {HttpServletRequest.class},
                (proxy, method, args) -> {
                    switch (method.getName()) {
                        case "getInputStream":
                            return servletInputStream(body);
                        case "getMethod":
                            return "POST";
                        default:
                            Class<?> rt = method.getReturnType();
                            if (rt == boolean.class) {
                                return Boolean.FALSE;
                            }
                            if (rt == int.class) {
                                return 0;
                            }
                            return null;
                    }
                });
    }

    private static File writeSecretFile() throws Exception {
        File f = File.createTempFile("saiku-1905-secret", ".txt");
        f.deleteOnExit();
        Files.write(f.toPath(), SECRET.getBytes(StandardCharsets.UTF_8));
        return f;
    }

    private static String fileUri(File f) {
        return f.toURI().toString(); // file:/// with forward slashes on every OS
    }

    private static String xxeSoapBody(File secret) {
        return "<?xml version=\"1.0\"?>\n" + "<!DOCTYPE Envelope [ <!ENTITY xxe SYSTEM \""
                + fileUri(secret) + "\"> ]>\n"
                + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"" + SOAP_NS + "\">\n"
                + "  <SOAP-ENV:Header/>\n"
                + "  <SOAP-ENV:Body>&xxe;</SOAP-ENV:Body>\n"
                + "</SOAP-ENV:Envelope>\n";
    }

    private static String wellFormedSoapBody() {
        return "<?xml version=\"1.0\"?>\n" + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\""
                + SOAP_NS + "\">\n"
                + "  <SOAP-ENV:Header/>\n"
                + "  <SOAP-ENV:Body>\n"
                + "    <Discover xmlns=\"urn:schemas-microsoft-com:xml-analysis\"/>\n"
                + "  </SOAP-ENV:Body>\n"
                + "</SOAP-ENV:Envelope>\n";
    }

    /**
     * THE fix: feeding the XXE payload to the servlet's real parse entry point must reject the
     * DOCTYPE (external entity never resolved, secret never leaked).
     */
    @Test
    public void doctypePayloadIsRejectedNotResolved() throws Exception {
        File secret = writeSecretFile();
        SaikuXmlaServlet servlet = new SaikuXmlaServlet();
        Element[] parts = new Element[2];

        String leaked = null;
        try {
            servlet.unmarshallSoapMessage(requestWithBody(xxeSoapBody(secret).getBytes(StandardCharsets.UTF_8)), parts);
            // If a hardened parser somehow parsed it, the entity must NOT have resolved.
            leaked = parts[1] == null ? null : parts[1].getTextContent();
            fail("expected the DOCTYPE payload to be rejected, but the SOAP body parsed");
        } catch (XmlaException expected) {
            // disallow-doctype-decl trips a SAX parse error, wrapped as a client-side XmlaException.
            assertEquals("Client", expected.getFaultCode());
        }

        if (leaked != null) {
            assertFalse(
                    "external entity must not be resolved — secret file content leaked into the SOAP body",
                    leaked.contains(SECRET));
        }
    }

    /** A normal, DOCTYPE-free SOAP request still parses: Header + Body populated, no exception. */
    @Test
    public void wellFormedRequestStillParses() throws Exception {
        SaikuXmlaServlet servlet = new SaikuXmlaServlet();
        Element[] parts = new Element[2];

        servlet.unmarshallSoapMessage(requestWithBody(wellFormedSoapBody().getBytes(StandardCharsets.UTF_8)), parts);

        assertNotNull("Header element should be populated", parts[0]);
        assertEquals("Header", parts[0].getLocalName());
        assertNotNull("Body element should be populated", parts[1]);
        assertEquals("Body", parts[1].getLocalName());
        assertFalse(
                "no secret involved in a clean request",
                parts[1].getTextContent().contains(SECRET));
    }

    /** A SOAP envelope with no Header maps to {@code parts[0] == null}, mirroring the fork contract. */
    @Test
    public void headerlessRequestLeavesHeaderNull() throws Exception {
        SaikuXmlaServlet servlet = new SaikuXmlaServlet();
        Element[] parts = new Element[2];
        String body = "<?xml version=\"1.0\"?>\n" + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\""
                + SOAP_NS + "\">\n"
                + "  <SOAP-ENV:Body><Discover xmlns=\"urn:schemas-microsoft-com:xml-analysis\"/></SOAP-ENV:Body>\n"
                + "</SOAP-ENV:Envelope>\n";

        servlet.unmarshallSoapMessage(requestWithBody(body.getBytes(StandardCharsets.UTF_8)), parts);

        assertNull("absent Header must be null, not a fabricated element", parts[0]);
        assertNotNull(parts[1]);
        assertEquals("Body", parts[1].getLocalName());
    }

    /**
     * Reversion sanity: proves the payload is a genuine XXE. A plain (un-hardened) parser — the fork's
     * behaviour before this fix — DOES resolve the external entity and leak the file, so the guard
     * above is meaningful and will fail if the override regresses to such a parser.
     */
    @Test
    public void unhardenedParserWouldLeakTheFile() throws Exception {
        File secret = writeSecretFile();
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        DocumentBuilder db = dbf.newDocumentBuilder();

        InputStream in = new ByteArrayInputStream(xxeSoapBody(secret).getBytes(StandardCharsets.UTF_8));
        Document doc = db.parse(new InputSource(in));
        String bodyText = doc.getDocumentElement().getTextContent();

        assertTrue(
                "sanity: the un-hardened parser is expected to resolve the entity and leak the secret",
                bodyText.contains(SECRET));
    }
}

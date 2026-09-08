/*
 *   Copyright 2026 Spicule Ltd
 *   Apache License, Version 2.0.
 */
package org.saiku.launcher.it;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Duration;
import java.util.Locale;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * saiku#1905 (CWE-611 XXE + missing auth gate on {@code /xmla}) reversion guard, driven through the
 * REAL Jetty + Spring Security filter chain via {@link SaikuItHarness} — not just the pure-unit test
 * in {@code saiku-core/saiku-service}'s {@code SaikuXmlaServletXxeTest}, which calls {@code
 * SaikuXmlaServlet#unmarshallSoapMessage} directly and so cannot see whether the auth gate in {@code
 * applicationContext-saiku.xml} is actually wired into the chain.
 *
 * <p>The auth gate is a DEDICATED ant-matched {@code <security:http pattern="/xmla/**">} secured
 * chain declared FIRST in {@code applicationContext-saiku.xml}. That shape is load-bearing: the XMLA
 * servlet is prefix-mapped {@code /xmla/*}, and the {@code security="none"} chains match MVC-style
 * (servlet-path-relative), so {@code /xmla/} (pathInfo {@code "/"}) and {@code /xmla/<seg>} would
 * otherwise be claimed by a no-filter none chain (e.g. {@code pattern="/"} or {@code "/ui/**"}) and
 * served anonymously — never reaching any {@code intercept-url} in the main chain. The dedicated
 * chain claims every {@code /xmla} shape before any none chain can.
 *
 * <p>Locks four facts that only a real HTTP round-trip can prove:
 *
 * <ol>
 *   <li>Anonymous {@code POST /xmla}, {@code /xmla/} and {@code /xmla/<seg>} are all rejected with
 *       401 — the dedicated {@code /xmla/**} chain's {@code isFullyAuthenticated()} rule must survive
 *       future edits to {@code applicationContext-saiku.xml}. Without the dedicated chain (the
 *       pre-fix state), the trailing-slash / sub-path shapes were served anonymously by a
 *       {@code security="none"} chain.
 *   <li>HTTP Basic {@code admin/admin} with a well-formed Discover envelope is NOT blocked by the
 *       auth gate — it authenticates and reaches the servlet (proven by getting a SOAP envelope
 *       back, not a bare auth rejection). This is the "don't lock out legitimate XMLA clients" half
 *       of the fix — Excel and olap4j both speak Basic auth over XMLA.
 *   <li>Even authenticated, a DOCTYPE/external-entity SOAP body is rejected by the hardened parser
 *       end-to-end: the servlet responds with a SOAP fault, and — the actual security property —
 *       the fault body never contains the injected file marker. This is the true end-to-end XXE
 *       reversion guard: it goes through Jetty, Spring Security, and mondrian's real SOAP fault
 *       marshalling, none of which the pure-unit test exercises.
 * </ol>
 *
 * <p>NOT covered by a live IT here: the dedicated chain's {@code loginRateLimitFilter} 429
 * brute-force short-circuit. {@code LoginRateLimiter} is per-client-IP with a 15-minute window and
 * no HTTP-reachable reset, and failsafe runs the whole IT suite in ONE fork ({@code forkCount=1},
 * {@code reuseForks=true}) sharing a single booted webapp — so tripping the budget for
 * {@code 127.0.0.1} here would lock out every other IT that authenticates from localhost for 15
 * minutes. A live 429 IT is therefore deliberately omitted as inherently suite-poisoning / flaky.
 * The 429 behaviour is unit-covered against an injected strict limiter in {@code SessionResourceTest}
 * ({@code login_blockedByRateLimiter_returns429WithRetryAfter}); the {@code custom-filter} wiring
 * into the {@code /xmla/**} chain is verified by review. See {@code applicationContext-saiku.xml}.
 *
 * <p>Deliberately does NOT assert an exact status code for the XXE case: mondrian's {@code
 * XmlaServlet#doPost} maps a fault raised during the {@code INITIAL_PARSE} phase (which is exactly
 * where the hardened parser rejects a DOCTYPE) to HTTP 401 in its own fault-phase table — a SOAP-level
 * convention unrelated to Spring Security's auth gate. Asserting on the response BODY (a real SOAP
 * fault, no leaked secret) is what actually matters and is unambiguous either way.
 */
public class XmlaAuthIT {

    private static final String SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/";
    private static final String SECRET = "TOP-SECRET-XXE-MARKER-1905-IT";

    private static SaikuItHarness harness;
    private static String baseUrl;
    private static HttpClient client;

    @BeforeClass
    public static void boot() throws Exception {
        harness = SaikuItHarness.shared();
        baseUrl = harness.baseUrl();
        client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    private static String wellFormedDiscoverBody() {
        return "<?xml version=\"1.0\"?>\n" + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"" + SOAP_NS + "\">\n"
                + "  <SOAP-ENV:Header/>\n"
                + "  <SOAP-ENV:Body>\n"
                + "    <Discover xmlns=\"urn:schemas-microsoft-com:xml-analysis\">\n"
                + "      <RequestType>DISCOVER_DATASOURCES</RequestType>\n"
                + "      <Restrictions><RestrictionList/></Restrictions>\n"
                + "      <Properties><PropertyList/></Properties>\n"
                + "    </Discover>\n"
                + "  </SOAP-ENV:Body>\n"
                + "</SOAP-ENV:Envelope>\n";
    }

    private static String xxeDoctypeBody(File secret) {
        String fileUri = secret.toURI().toString(); // file:/// with forward slashes on every OS
        return "<?xml version=\"1.0\"?>\n" + "<!DOCTYPE Envelope [ <!ENTITY xxe SYSTEM \""
                + fileUri + "\"> ]>\n"
                + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"" + SOAP_NS + "\">\n"
                + "  <SOAP-ENV:Header/>\n"
                + "  <SOAP-ENV:Body>&xxe;</SOAP-ENV:Body>\n"
                + "</SOAP-ENV:Envelope>\n";
    }

    /** POST a raw XMLA SOAP body against {@code path}, optionally with an Authorization header. */
    private static HttpResponse<String> postXmla(String path, String body, String authorizationHeader)
            throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .timeout(Duration.ofSeconds(20))
                // Must be text/xml (or contain it) — DefaultXmlaServlet#doPost rejects any other
                // Content-Type with an IllegalArgumentException before ever reaching the SOAP
                // unmarshaller, which is not the code path this IT is targeting.
                .header("Content-Type", "text/xml")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        if (authorizationHeader != null) {
            builder.header("Authorization", authorizationHeader);
        }
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    public void anonymousPostToXmlaIs401() throws Exception {
        HttpResponse<String> resp = postXmla("/xmla", wellFormedDiscoverBody(), null);
        assertEquals(
                "Unauthenticated POST /xmla must be rejected by Spring Security BEFORE reaching the "
                        + "servlet (saiku#1905's dedicated /xmla/** secured chain) — status="
                        + resp.statusCode() + ", body: " + resp.body(),
                401,
                resp.statusCode());
    }

    @Test
    public void anonymousPostToXmlaTrailingSlashIs401() throws Exception {
        HttpResponse<String> resp = postXmla("/xmla/", wellFormedDiscoverBody(), null);
        assertEquals(
                "Unauthenticated POST /xmla/ must also be gated (saiku#1905's dedicated /xmla/** "
                        + "secured chain — the trailing-slash shape the pre-fix gate missed) — status="
                        + resp.statusCode() + ", body: " + resp.body(),
                401,
                resp.statusCode());
    }

    @Test
    public void anonymousPostToXmlaSubPathIsGated() throws Exception {
        // saiku#1905 robustness: a /xmla/<seg> shape has pathInfo "/<seg>", which an
        // MVC-servlet-relative security="none" chain (e.g. pattern="/ui/**") would otherwise
        // claim as a no-filter chain — serving the XMLA servlet anonymously. The dedicated
        // ant-matched /xmla/** secured chain must claim EVERY /xmla shape first and require auth.
        HttpResponse<String> resp = postXmla("/xmla/ui/settings", wellFormedDiscoverBody(), null);
        assertEquals(
                "Unauthenticated POST /xmla/<seg> must be gated by the dedicated /xmla/** chain "
                        + "(not swallowed by an MVC servlet-relative none chain) — status=" + resp.statusCode()
                        + ", body: " + resp.body(),
                401,
                resp.statusCode());
    }

    @Test
    public void authenticatedWellFormedRequestReachesServlet() throws Exception {
        HttpResponse<String> resp = postXmla("/xmla", wellFormedDiscoverBody(), harness.adminBasicAuth());

        assertNotEquals(
                "Basic-auth admin/admin must not be blocked by the auth gate — status=" + resp.statusCode() + ", body: "
                        + resp.body(),
                401,
                resp.statusCode());
        assertNotEquals(
                "Basic-auth admin/admin must not be blocked by the auth gate — status=" + resp.statusCode() + ", body: "
                        + resp.body(),
                403,
                resp.statusCode());
        // Reaching the servlet means we get a SOAP envelope back (success or fault), not an empty
        // auth-rejection body — proving the request authenticated and was actually processed.
        assertTrue(
                "expected a SOAP envelope response body from the servlet, got status=" + resp.statusCode() + ", body: "
                        + resp.body(),
                resp.body() != null && resp.body().contains("Envelope"));
    }

    @Test
    public void authenticatedXxePayloadIsRejectedNotLeaked() throws Exception {
        File secret = File.createTempFile("saiku-1905-it-secret", ".txt");
        secret.deleteOnExit();
        Files.write(secret.toPath(), SECRET.getBytes(StandardCharsets.UTF_8));

        HttpResponse<String> resp = postXmla("/xmla", xxeDoctypeBody(secret), harness.adminBasicAuth());
        String body = resp.body() == null ? "" : resp.body();

        // The actual security property under test: even though this authenticated request reaches
        // the servlet and its hardened parser rejects the DOCTYPE (a SOAP-level fault, not an auth
        // rejection — see the class javadoc for why the status code itself is not asserted here),
        // the external entity must never have been resolved.
        assertFalse(
                "external entity must not be resolved end-to-end through the real servlet chain — "
                        + "secret file content leaked into the XMLA response body (status="
                        + resp.statusCode() + "): " + body,
                body.contains(SECRET));
        assertTrue(
                "expected a SOAP fault body for the rejected DOCTYPE payload (status=" + resp.statusCode() + "): "
                        + body,
                body.toLowerCase(Locale.ROOT).contains("fault"));
    }
}

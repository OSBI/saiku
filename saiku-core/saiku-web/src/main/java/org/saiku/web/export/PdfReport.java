package org.saiku.web.export;

import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.rest.objects.resultset.QueryResult;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.print.PrintTranscoder;
import org.apache.commons.lang.StringUtils;
import org.apache.fop.apps.Fop;
import org.apache.fop.apps.FopFactory;
import org.apache.fop.apps.MimeConstants;
import org.htmlcleaner.CleanerProperties;
import org.htmlcleaner.DomSerializer;
import org.htmlcleaner.HtmlCleaner;
import org.htmlcleaner.TagNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.awt.print.PageFormat;
import java.awt.print.Paper;
import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMResult;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXResult;
import javax.xml.transform.stream.StreamResult;

public class PdfReport {

    private static final Logger log = LoggerFactory.getLogger(PdfReport.class);

    public byte[] pdf(QueryResult qr, String svg) throws Exception {

        int resultWidth = (qr != null && qr.getCellset() != null && qr.getCellset().size() > 0 ? qr.getCellset().get(0).length : 0);
        if (resultWidth == 0) {
            throw new SaikuServiceException("Cannot convert empty result to PDF");
        }
        Rectangle size = PageSize.A4.rotate();
        if (resultWidth > 8) {
            size = PageSize.A3.rotate();
        } if (resultWidth > 16) {
            size = PageSize.A2.rotate();
        } if (resultWidth > 32) {
            size = PageSize.A1.rotate();
        } if (resultWidth > 64) {
            size = PageSize.A0.rotate();
        }

        Document document = new Document(size,15,15,10,10);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        document.open();

        ByteArrayOutputStream pdf = new ByteArrayOutputStream();
        populatePdf(qr, pdf);

        // do we want to add a svg image?
        if (StringUtils.isNotBlank(svg)) {
            document.newPage();
            StringBuffer s1 = new StringBuffer(svg);
            if (!svg.startsWith("<svg xmlns=\"http://www.w3.org/2000/svg\" ")) {
                s1.insert(s1.indexOf("<svg") + 4, " xmlns='http://www.w3.org/2000/svg'");
            }

            String t = "<?xml version='1.0' encoding='ISO-8859-1'"
                    + " standalone='no'?>" + s1.toString();
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();
            cb.concatCTM(1.0f, 0, 0, 1.0f, 36, 0);
            float width = document.getPageSize().getWidth() - 20;
            float height = document.getPageSize().getHeight() - 20;
            Graphics2D g2 = cb.createGraphics(width, height);
            //g2.rotate(Math.toRadians(-90), 100, 100);
            PrintTranscoder prm = new PrintTranscoder();
            TranscoderInput ti = new TranscoderInput(new StringReader(t));
            prm.transcode(ti, null);
            PageFormat pg = new PageFormat();
            Paper pp = new Paper();
            pp.setSize(width, height);
            pp.setImageableArea(5, 5, width, height);
            pg.setPaper(pp);
            prm.print(g2, pg, 0);
            g2.dispose();
            cb.restoreState();
        }

      //  document.close();
        return pdf.toByteArray();
    }

    public void populatePdf(QueryResult qr, OutputStream pdf) throws Exception {
        Long start = (new Date()).getTime();
        String content = JSConverter.convertToHtml(qr);

        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
        Date date = new Date();
        content = "<p>" + "Saiku Export - " + dateFormat.format(date) + "</p>" + content;


        Long rhino = (new Date()).getTime();


        org.w3c.dom.Document out = getDom(content);

        org.w3c.dom.Document foDoc = getFO(out);

        String s= toString(out);
        System.out.println(s);

        try {

            pdf.write(fo2PDF(foDoc, null));
        } catch (java.io.FileNotFoundException e) {
            e.printStackTrace();
            System.out.println("Error creating PDF: ");
        } catch (java.io.IOException e) {
            e.printStackTrace();
            System.out.println("Error writing PDF: ");
        }

        Long parse = (new Date()).getTime();
        log.debug("PDF Output - JSConverter: " + (rhino - start) + "ms PDF Render: " + (parse - rhino) + "ms");
    }



  public static String toString(org.w3c.dom.Document doc) {
    try {
      StringWriter sw = new StringWriter();
      TransformerFactory tf = TransformerFactory.newInstance();
      Transformer transformer = tf.newTransformer();
      transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
      transformer.setOutputProperty(OutputKeys.METHOD, "xml");
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

      transformer.transform(new DOMSource(doc), new StreamResult(sw));
      return sw.toString();
    } catch (Exception ex) {
      throw new RuntimeException("Error converting to String", ex);
    }
  }


  private org.w3c.dom.Document getDom(String html){
        ByteArrayInputStream input = new ByteArrayInputStream(html.getBytes());

        final HtmlCleaner cleaner = new HtmlCleaner();
        CleanerProperties props = cleaner.getProperties();

      props.setAdvancedXmlEscape(true);
      
      props.setRecognizeUnicodeChars(true);
      props.setTranslateSpecialEntities(true);
        DomSerializer doms = new DomSerializer(props, false);

        org.w3c.dom.Document xmlDoc;

        try {
            TagNode node = cleaner.clean(input);
            xmlDoc = doms.createDOM(node);
            return xmlDoc;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    private org.w3c.dom.Document getFO(org.w3c.dom.Document xmlDoc){

        try {
            return xml2FO(xmlDoc);
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    private byte[] fo2PDF(org.w3c.dom.Document foDocument, String styleSheet) {
        FopFactory fopFactory = FopFactory.newInstance();

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            Fop fop = fopFactory.newFop(MimeConstants.MIME_PDF, out);
            Transformer transformer = getTransformer(styleSheet);

            Source src = new DOMSource(foDocument);
            Result res = new SAXResult(fop.getDefaultHandler());

            transformer.transform(src, res);

            return out.toByteArray();

        } catch (Exception ex) {
            return null;
        }
    }

    private Transformer getTransformer(String styleSheet) {
        try {
            TransformerFactory tFactory = TransformerFactory.newInstance();

            DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
            dFactory.setNamespaceAware(true);

            InputStream is = this.getClass().getResourceAsStream("xhtml2fo.xsl");
            DocumentBuilder dBuilder = dFactory.newDocumentBuilder();
            org.w3c.dom.Document xslDoc = dBuilder.parse(is);
            DOMSource xslDomSource = new DOMSource(xslDoc);

            return tFactory.newTransformer(xslDomSource);
        } catch (javax.xml.transform.TransformerException e) {
            e.printStackTrace();
            return null;
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return null;
        } catch (javax.xml.parsers.ParserConfigurationException e) {
            e.printStackTrace();
            return null;
        } catch (org.xml.sax.SAXException e) {
            e.printStackTrace();
            return null;
        }
    }
    private static org.w3c.dom.Document xml2FO(org.w3c.dom.Document xml) throws Exception {
        DOMSource xmlDomSource = new DOMSource(xml);
        DOMResult domResult = new DOMResult();

        TransformerFactory factory = TransformerFactory.newInstance();
        Transformer transformer = factory.newTransformer();

        if (transformer == null) {
            System.out.println("Error creating transformer");
            System.exit(1);
        }

        try {
            transformer.transform(xmlDomSource, domResult);
        } catch (javax.xml.transform.TransformerException e) {
            return null;
        }

        return (org.w3c.dom.Document) domResult.getNode();
    }
}

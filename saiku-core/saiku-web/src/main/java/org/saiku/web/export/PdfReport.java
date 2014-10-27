/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.saiku.web.export;

import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.rest.objects.resultset.QueryResult;

import com.itextpdf.text.Document;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorker;
import com.itextpdf.tool.xml.XMLWorkerFontProvider;
import com.itextpdf.tool.xml.XMLWorkerHelper;
import com.itextpdf.tool.xml.css.CssFile;
import com.itextpdf.tool.xml.css.StyleAttrCSSResolver;
import com.itextpdf.tool.xml.html.CssAppliers;
import com.itextpdf.tool.xml.html.CssAppliersImpl;
import com.itextpdf.tool.xml.html.Tags;
import com.itextpdf.tool.xml.parser.XMLParser;
import com.itextpdf.tool.xml.pipeline.css.CSSResolver;
import com.itextpdf.tool.xml.pipeline.css.CssResolverPipeline;
import com.itextpdf.tool.xml.pipeline.end.PdfWriterPipeline;
import com.itextpdf.tool.xml.pipeline.html.HtmlPipeline;
import com.itextpdf.tool.xml.pipeline.html.HtmlPipelineContext;

import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.print.PrintTranscoder;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.awt.*;
import java.awt.print.PageFormat;
import java.awt.print.Paper;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.StringReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Pdf Report.
 */
public class PdfReport {

  private static final Logger LOG = LoggerFactory.getLogger(PdfReport.class);

  public byte[] pdf(QueryResult qr, String svg) throws Exception {

    int resultWidth =
        qr != null && qr.getCellset() != null && qr.getCellset().size() > 0 ? qr.getCellset().get(0).length : 0;
    if (resultWidth == 0) {
      throw new SaikuServiceException("Cannot convert empty result to PDF");
    }
    Rectangle size = PageSize.A4.rotate();
    if (resultWidth > 8) {
      size = PageSize.A3.rotate();
    }
    if (resultWidth > 16) {
      size = PageSize.A2.rotate();
    }
    if (resultWidth > 32) {
      size = PageSize.A1.rotate();
    }
    if (resultWidth > 64) {
      size = PageSize.A0.rotate();
    }

    Document document = new Document(size, 15, 15, 10, 10);
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PdfWriter writer = PdfWriter.getInstance(document, baos);
    document.open();
    populatePdf(document, writer, qr);

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

    document.close();
    return baos.toByteArray();
  }

  public void populatePdf(Document doc, PdfWriter writer, QueryResult qr) throws Exception {
    Long start = (new Date()).getTime();
    String content = JSConverter.convertToHtml(qr);

    DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
    Date date = new Date();
    content = "<p>" + "Saiku Export - " + dateFormat.format(date) + "</p><p>&nbsp;</p>" + content;


    InputStream contentIs = new ByteArrayInputStream(content.getBytes("UTF-8"));
    Long rhino = (new Date()).getTime();
    // CSS
    CSSResolver cssResolver = new StyleAttrCSSResolver();
    CssFile cssFile = XMLWorkerHelper.getCSS(getClass().getResourceAsStream("saiku.table.pdf.css"));
    cssResolver.addCss(cssFile);
    // HTML
    XMLWorkerFontProvider fontProvider = new XMLWorkerFontProvider();
    fontProvider.defaultEncoding = "UTF-8";
    CssAppliers cssAppliers = new CssAppliersImpl(fontProvider);
    HtmlPipelineContext htmlContext = new HtmlPipelineContext(cssAppliers);
    htmlContext.setTagFactory(Tags.getHtmlTagProcessorFactory());
    // Pipelines
    PdfWriterPipeline pdf = new PdfWriterPipeline(doc, writer);
    HtmlPipeline html = new HtmlPipeline(htmlContext, pdf);
    CssResolverPipeline css = new CssResolverPipeline(cssResolver, html);
    XMLWorker worker = new XMLWorker(css, true);
    XMLParser p = new XMLParser(worker);
    p.parse(contentIs, true);
    Long parse = (new Date()).getTime();
    LOG.debug("PDF Output - JSConverter: " + (rhino - start) + "ms PDF Render: " + (parse - rhino) + "ms");
  }
}

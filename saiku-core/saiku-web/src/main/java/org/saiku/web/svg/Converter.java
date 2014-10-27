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

package org.saiku.web.svg;

/**
 * @since 1/15/13, 10:29 AM
 */

import org.apache.batik.transcoder.*;
import org.apache.batik.transcoder.image.JPEGTranscoder;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.image.TIFFTranscoder;
import org.apache.commons.io.IOUtils;
import org.apache.fop.svg.PDFTranscoder;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Converter.
 */
public abstract class Converter {

  /**
   * Convert.
   *
   * @param in
   * @param out
   * @param size
   * @throws IOException
   * @throws TranscoderException
   */
  public abstract void convert(InputStream in, OutputStream out, Integer size) throws IOException, TranscoderException;

  private final String contentType;
  private final String extension;

  protected Converter(String contentType, String extension) {
    this.contentType = contentType;
    this.extension = extension;
  }

  public String getContentType() {
    return contentType;
  }

  public String getExtension() {
    return extension;
  }

  public static Converter byType(String type) {
    if (type.equals("SVG")) {
      return new SvgConverter();
    }
    if (type.equals("PNG")) {
      return new PngConverter();
    }
    if (type.equals("TIFF")) {
      return new TiffConverter();
    }
    if (type.equals("JPG")) {
      return new JpgConverter();
    }
    if (type.equals("PDF")) {
      return new PdfConverter();
    }
    return null;
  }
}

/**
 * Svg Converter.
 */
class SvgConverter extends Converter {

  public SvgConverter() {
    super("image/svg+xml", "svg");
  }

  public void convert(InputStream in, OutputStream out, Integer size) throws IOException {
    IOUtils.copy(in, out);
  }

}

/**
 * Batik Converter.
 */
abstract class BatikConverter extends Converter {

  protected BatikConverter(String extension) {
    super("image/" + extension, extension);
  }

  protected BatikConverter(String contentType, String extension) {
    super(contentType, extension);
  }

  public void convert(InputStream in, OutputStream out, Integer size) throws TranscoderException {
    Transcoder t = createTranscoder();
    if (size != null) {
      final float sizeBound = Math.max(Math.min(size, 2000.0f), 32.0f);
      t.addTranscodingHint(SVGAbstractTranscoder.KEY_WIDTH, sizeBound);
    }
    t.transcode(new TranscoderInput(in), new TranscoderOutput(out));
  }

  protected abstract Transcoder createTranscoder();

}

/**
 * Png Converter.
 */
class PngConverter extends BatikConverter {

  public PngConverter() {
    super("png");
  }

  protected Transcoder createTranscoder() {
    return new PNGTranscoder();
  }

}

/**
 * Jpg Converter.
 */
class JpgConverter extends BatikConverter {

  public JpgConverter() {
    super("image/jpeg", "jpg");
  }

  protected Transcoder createTranscoder() {
    Transcoder t = new JPEGTranscoder();
    t.addTranscodingHint(JPEGTranscoder.KEY_QUALITY, 0.95f);
    return t;
  }

}

/**
 * Tiff Converter.
 */
class TiffConverter extends BatikConverter {

  public TiffConverter() {
    super("tiff");
  }

  protected Transcoder createTranscoder() {
    return new TIFFTranscoder();
  }

}

/**
 * Pdf Converter.
 */
class PdfConverter extends BatikConverter {

  public PdfConverter() {
    super("application/pdf", "pdf");
  }

  protected Transcoder createTranscoder() {
    return new PDFTranscoder();
  }

}

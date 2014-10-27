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
package org.saiku.olap.util;

import org.apache.commons.lang.LocaleUtils;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Properties;

/**
 * SaikuProperties.
 */
public class SaikuProperties extends Properties {


  private static final long serialVersionUID = 4835692048422342660L;

  private static final Logger LOG = LoggerFactory.getLogger(SaikuProperties.class);


  @NotNull
  private final PropertySource propertySource;
  private int populateCount;

  private static SaikuProperties instance = instance();

  private static final String SAIKU_PROPERTIES = "saiku.properties";

  /**
   * Returns the singleton.
   *
   * @return Singleton instance
   */
  private static synchronized SaikuProperties instance() {
    if (instance == null) {
      instance = new SaikuProperties();
      instance.populate();
    }
    return instance;
  }

  private SaikuProperties() {
    this.propertySource =
        new FilePropertySource(new File(SAIKU_PROPERTIES));
  }

  /**
   * PropertySource.
   */
  public interface PropertySource {
    InputStream openStream();

    boolean isStale();

    String getDescription();
  }

  /**
   * FilePropertySource.
   */
  static class FilePropertySource implements PropertySource {
    private final File file;
    private long lastModified;

    FilePropertySource(File file) {
      this.file = file;
      this.lastModified = 0;
    }

    @NotNull
    public InputStream openStream() {
      try {
        this.lastModified = file.lastModified();
        FileInputStream in = new FileInputStream(file);
        LOG.info("Opening properties file: '" + file + "'");
        return in;
      } catch (FileNotFoundException e) {
        throw new RuntimeException(
            "Error while opening properties file: '" + file + "'", e);
      }
    }

    public boolean isStale() {
      return file.exists()
             && file.lastModified() > this.lastModified;
    }

    @NotNull
    public String getDescription() {
      return "file=" + file.getAbsolutePath()
             + " (exists=" + file.exists() + ")";
    }
  }

  /**
   * Implementation of {@link PropertySource} which reads from a {@link URL}.
   */
  static class UrlPropertySource implements PropertySource {
    private final URL url;
    private long lastModified;

    UrlPropertySource(URL url) {
      this.url = url;
    }

    private URLConnection getConnection() {
      try {
        return url.openConnection();
      } catch (IOException e) {
        throw new RuntimeException("Error while opening properties file '" + url + "'", e);
      }
    }

    public InputStream openStream() {
      try {
        final URLConnection connection = getConnection();
        this.lastModified = connection.getLastModified();
        return connection.getInputStream();
      } catch (IOException e) {
        throw new RuntimeException(
            "Error while opening properties file '" + url + "'",
            e);
      }
    }

    public boolean isStale() {
      final long lastModified = getConnection().getLastModified();
      return lastModified > this.lastModified;
    }

    public String getDescription() {
      return url.toExternalForm();
    }
  }

  /**
   * Loads saiku.properties from: 1) the file "$PWD/" 2) CLASSPATH 3) the system properties
   */
  void populate() {
    loadIfStale(propertySource);

    URL url = null;
    File file = new File(SAIKU_PROPERTIES);
    if (file.exists() && file.isFile()) {
      // Read properties file "saiku.properties" from PWD, if it exists.
      try {
        url = file.toURI().toURL();
      } catch (MalformedURLException e) {
        LOG.warn(
            "Saiku: file '"
            + file.getAbsolutePath()
            + "' could not be loaded",
            e
        );
      }
    } else {
      // Then try load it from classloader
      url =
          SaikuProperties.class.getClassLoader().getResource(
              SAIKU_PROPERTIES);
    }

    if (url != null) {
      load(new UrlPropertySource(url));
    } else {
      LOG.warn(
          "saiku.properties can't be found under '"
          + new File(".").getAbsolutePath() + "' or classloader"
      );
    }

    // copy in all system properties which start with "saiku."
    int count = 0;
    for (Enumeration<Object> keys = System.getProperties().keys();
      //@formatter:off
         keys.hasMoreElements();) {
        //@formatter:on
      String key = (String) keys.nextElement();
      String value = System.getProperty(key);
      if (key.startsWith("saiku.")) {
        if (LOG.isDebugEnabled()) {
          LOG.debug("System property : populate: key=" + key + ", value=" + value);
        }
        instance.setProperty(key, value);
        count++;
      }
    }
    if (populateCount++ == 0) {
      LOG.info(
          "Saiku: loaded " + count + " system properties");
    }
  }

  private void loadIfStale(@NotNull PropertySource source) {
    if (source.isStale()) {
      if (LOG.isDebugEnabled()) {
        LOG.debug("Saiku: loading " + source.getDescription());
      }
      load(source);
    }
  }

  private void load(@NotNull final PropertySource source) {
    try {
      instance.load(source.openStream());
      if (populateCount == 0) {
        LOG.info(
            "Saiku: properties loaded from '"
            + source.getDescription()
            + "'"
        );
        instance.list(System.out);
      }
    } catch (IOException e) {
      LOG.error(
          "Saiku: error while loading properties "
          + "from '" + source.getDescription() + "' (" + e.getMessage() + ")"
      );
    }
  }


  public static final Boolean OLAPEFAULTNONEMPTY = getPropBoolean("saiku.olap.nonempty");
  public static final String WEBEXPORTCSVNAME = getPropString("saiku.web.export.csv.name", "saiku-export");
  public static final String WEBEXPORTCSVDELIMITER = getPropString("saiku.web.export.csv.delimiter", ",");
  public static final String WEBEXPORTCSVTEXTESCAPE = getPropString("saiku.web.export.csv.textEscape", "\"");
  public static final String WEBEXPORTCSVTEXTENCODING = getPropString("saiku.web.export.csv.textEncoding", "UTF-8");
  public static final Boolean WEBEXPORTCSVUSEFORMATTEDVALUE =
      getPropBoolean("saiku.web.export.csv.useFormattedValue");
  public static final String WEBEXPORTCSVNUMBERFORMAT = getPropString("saiku.web.export.csv.numberformat", "#,##.00");
  public static final String WEBEXPORTCSVDATEFORMAT = getPropString("saiku.web.export.csv.dateformat", "dd-MMM-yyyy");
  public static final String WEBEXPORTCSVTIMESTAMPFORMAT =
      getPropString("saiku.web.export.csv.timestampformat", "dd-MMM-yyyy HH:mm:ss");
  public static final String WEBEXPORTEXCELNAME = getPropString("saiku.web.export.excel.name", "saiku-export");
  public static final String WEBEXPORTEXCELFORMAT = getPropString("saiku.web.export.excel.format", "xlsx");
  public static final String WEBEXPORTEXCELDEFAULTNUMBERFORMAT =
      getPropString("saiku.web.export.excel.numberformat", "#,##0.00");
  public static final String FORMATDEFAULTNUMBERFORMAT = getPropString("saiku.format.numberformat", "#,##0.00");
  public static final Locale LOCALE = getLocale();
  public static final Boolean OLAPCONVERTQUERY = getPropBoolean("saiku.olap.convert.query");

  private static Locale getLocale() {
    String locale = null;
    try {
      locale = getPropString("saiku.format.default.LOCALE", null);
      if (locale != null) {
        return LocaleUtils.toLocale(locale);
      }
    } catch (Exception e) {
      LOG.warn("Property: saiku.format.default.LOCALE with value: " + locale
               + ", cannot be used for a Locale, falling back to default LOCALE: " + Locale.getDefault(), e);
    }

    return Locale.getDefault();
  }

  private static Boolean getPropBoolean(String key) {
    Boolean ret;
    if (instance.containsKey(key)) {
      ret = Boolean.parseBoolean(instance.getProperty(key));
    } else {
      ret = Boolean.parseBoolean("false");
    }
    return ret;
  }

  private static String getPropString(String key, String defaultValue) {
    String ret;
    if (instance.containsKey(key)) {
      ret = instance.getProperty(key);
    } else {
      ret = defaultValue;
    }
    return ret;
  }
}


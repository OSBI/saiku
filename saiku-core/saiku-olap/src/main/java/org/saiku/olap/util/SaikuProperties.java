package org.saiku.olap.util;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Properties;

import mondrian.olap.Util;

import org.eigenbase.util.property.*;

public class SaikuProperties {

 private final PropertySource propertySource;
 private int populateCount;

 private static SaikuProperties instance;
 private static final String SAIKU_PROPERTIES = "saiku.properties";

 /**
  * Returns the singleton.
  *
  * @return Singleton instance
  */
 public static synchronized SaikuProperties instance() {
     if (instance == null) {
         instance = new SaikuProperties();
//         instance.populate();
     }
     return instance;
 }

 public SaikuProperties() {
     this.propertySource =
         new FilePropertySource(new File(SAIKU_PROPERTIES));
 }

// public boolean triggersAreEnabled() {
//     return EnableTriggers.get();
// }

 public interface PropertySource {
     InputStream openStream();
     boolean isStale();
     String getDescription();
 }

 static class FilePropertySource implements PropertySource {
     private final File file;
     private long lastModified;

     FilePropertySource(File file) {
         this.file = file;
         this.lastModified = 0;
     }

     public InputStream openStream() {
         try {
             this.lastModified = file.lastModified();
             return new FileInputStream(file);
         } catch (FileNotFoundException e) {
             throw new RuntimeException (
                 "Error while opening properties file '" + file + "'",e);
         }
     }

     public boolean isStale() {
         return file.exists()
             && file.lastModified() > this.lastModified;
     }

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
             throw new RuntimeException ("Error while opening properties file '" + url + "'", e);
         }
     }

     public InputStream openStream() {
         try {
             final URLConnection connection = getConnection();
             this.lastModified = connection.getLastModified();
             return connection.getInputStream();
         } catch (IOException e) {
             throw Util.newInternal(
                     e,
                     "Error while opening properties file '" + url + "'");
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
  * Loads this property set from: the file "$PWD/mondrian.properties" (if it
  * exists); the "mondrian.properties" in the CLASSPATH; and from the system
  * properties.
  */
 
 /*
 public void populate() {
     // Read properties file "mondrian.properties", if it exists. If we have
     // read the file before, only read it if it is newer.
     loadIfStale(propertySource);

     URL url = null;
     File file = new File(SAIKU_PROPERTIES);
     if (file.exists() && file.isFile()) {
         // Read properties file "mondrian.properties" from PWD, if it
         // exists.
         try {
             url = file.toURI().toURL();
         } catch (MalformedURLException e) {
        	 // TODO replace
             System.out.println (
                 "Mondrian: file '"
                 + file.getAbsolutePath()
                 + "' could not be loaded");
             e.printStackTrace();
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
         System.out.println(
             "mondrian.properties can't be found under '"
             + new File(".").getAbsolutePath() + "' or classloader");
     }

     // copy in all system properties which start with "mondrian."
     int count = 0;
     for (Enumeration keys = System.getProperties().keys();
          keys.hasMoreElements();)
     {
         String key = (String) keys.nextElement();
         String value = System.getProperty(key);
         if (key.startsWith("mondrian.")) {
        	 // TODO remove
             // NOTE: the super allows us to bybase calling triggers
             // Is this the correct behavior?
//             if (LOGGER.isDebugEnabled()) {
                 System.out.println("populate: key=" + key + ", value=" + value);
//             }
             super.setProperty(key, value);
             count++;
         }
     }
     if (populateCount++ == 0) {
         LOGGER.info(
             "Mondrian: loaded " + count + " system properties");
     }
 }

 private void loadIfStale(PropertySource source) {
     if (source.isStale()) {
         if (LOGGER.isDebugEnabled()) {
             LOGGER.debug("Mondrian: loading " + source.getDescription());
         }
         load(source);
     }
 }

 private void load(final PropertySource source) {
     try {
         load(source.openStream());
         if (populateCount == 0) {
             LOGGER.info(
                 "Mondrian: properties loaded from '"
                 + source.getDescription()
                 + "'");
         }
     } catch (IOException e) {
         LOGGER.error(
             "Mondrian: error while loading properties "
             + "from '" + source.getDescription() + "' (" + e + ")");
     }
 }

 
 public transient final IntegerProperty QueryLimit =
     new IntegerProperty(
         this, "mondrian.query.limit", 40);

 
 public transient final StringProperty JdbcDrivers =
     new StringProperty(
         this,
         "mondrian.jdbcDrivers",
         "sun.jdbc.odbc.JdbcOdbcDriver,"
         + "org.hsqldb.jdbcDriver,"
         + "oracle.jdbc.OracleDriver,"
         + "com.mysql.jdbc.Driver");

 
 public transient final IntegerProperty ResultLimit =
     new IntegerProperty(
         this, "mondrian.result.limit", 0);

 */
}

//End MondrianProperties.java

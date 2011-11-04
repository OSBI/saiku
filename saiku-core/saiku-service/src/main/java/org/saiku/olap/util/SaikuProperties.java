/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.olap.util;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SaikuProperties extends Properties{


	private static final long serialVersionUID = 4835692048422342660L;
	
    private static final Logger log = LoggerFactory.getLogger(SaikuProperties.class);

    
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

	public SaikuProperties() {
		this.propertySource =
			new FilePropertySource(new File(SAIKU_PROPERTIES));
	}

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
				FileInputStream in = new FileInputStream(file);
				log.info("Opening properties file: '" + file + "'");
				return in;
			} catch (FileNotFoundException e) {
				throw new RuntimeException (
						"Error while opening properties file: '" + file + "'",e);
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
	 * Loads saiku.properties from: 1) the file "$PWD/" 2) CLASSPATH
	 * 3) the system properties
	 */
	public void populate() {
		loadIfStale(propertySource);

		URL url = null;
		File file = new File(SAIKU_PROPERTIES);
		if (file.exists() && file.isFile()) {
			// Read properties file "saiku.properties" from PWD, if it exists.
			try {
				url = file.toURI().toURL();
			} catch (MalformedURLException e) {
				log.warn(
						"Saiku: file '"
						+ file.getAbsolutePath()
						+ "' could not be loaded",
						e);
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
			log.warn(
					"saiku.properties can't be found under '"
					+ new File(".").getAbsolutePath() + "' or classloader");
		}

		// copy in all system properties which start with "saiku."
		int count = 0;
		for (Enumeration<Object> keys = System.getProperties().keys();
		keys.hasMoreElements();)
		{
			String key = (String) keys.nextElement();
			String value = System.getProperty(key);
			if (key.startsWith("saiku.")) {
				if (log.isDebugEnabled()) {
					log.debug("System property : populate: key=" + key + ", value=" + value);
				}
				instance.setProperty(key, value);
				count++;
			}
		}
		if (populateCount++ == 0) {
			log.info(
					"Saiku: loaded " + count + " system properties");
		}
	}

	private void loadIfStale(PropertySource source) {
		if (source.isStale()) {
			if (log.isDebugEnabled()) {
				log.debug("Saiku: loading " + source.getDescription());
			}
			load(source);
		}
	}

	private void load(final PropertySource source) {
		try {
			instance.load(source.openStream());
			if (populateCount == 0) {
				log.info(
						"Saiku: properties loaded from '"
						+ source.getDescription()
						+ "'");
				instance.list(System.out);
			}
		} catch (IOException e) {
			log.error(
					"Saiku: error while loading properties "
					+ "from '" + source.getDescription() + "' (" + e.getMessage() + ")");
		}
	}


	public static final Boolean olapDefaultNonEmpty = getPropBoolean("saiku.olap.nonempty","false");
	public static final String webExportExcelName = getPropString("saiku.web.export.excel.name","saiku-export");
	public static final String webExportCsvName = getPropString("saiku.web.export.csv.name","saiku-export");

	private static Boolean getPropBoolean(String key, String defaultValue) {
		Boolean ret;
		if (instance.containsKey(key)) {
			ret = Boolean.parseBoolean(instance.getProperty(key));
		} else {
			ret = Boolean.parseBoolean(defaultValue);
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

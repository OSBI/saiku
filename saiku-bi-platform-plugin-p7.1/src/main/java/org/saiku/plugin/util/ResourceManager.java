/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.saiku.plugin.util;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;

import org.saiku.service.license.Base64Coder;

import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.engine.core.system.PentahoSystem;

import java.io.*;
import java.util.HashMap;
import java.util.HashSet;

public class ResourceManager {


  private static ResourceManager instance;

  private static final String PLUGIN_DIR = PentahoSystem.getApplicationContext().getSolutionPath("system/saiku/");
  private static final String SOLUTION_DIR = PentahoSystem.getApplicationContext().getSolutionPath("saiku/");

  private static final HashSet<String> CACHEABLE_EXTENSIONS = new HashSet<>();
  private static final HashMap<String, String> cacheContainer = new HashMap<>();

  private boolean isCacheEnabled = true;

  public ResourceManager() {

    CACHEABLE_EXTENSIONS.add("html");

    final IPluginResourceLoader resLoader = PentahoSystem.get(IPluginResourceLoader.class, null);
    this.isCacheEnabled = Boolean.parseBoolean(resLoader.getPluginSetting(this.getClass(), "saiku/enable-cache"));

  }


  public static ResourceManager getInstance() {

    if (instance == null) {
      instance = new ResourceManager();
    }

    return instance;
  }

  private String getResourceAsString(final String path, final HashMap<String, String> tokens) throws IOException {

    final String extension = getResourceExtension(path);
    final String cacheKey = buildCacheKey(path, tokens);

    // If it's cachable and we have it, return it.
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension) && cacheContainer.containsKey(cacheKey)) {
      // return from cache. Make sure we return a clone of the original object
      return cacheContainer.get(cacheKey);
    }

    // Read file
    File file = new File(PLUGIN_DIR + path);
    // if not under plugin dir, try saiku solution dir
    if(!file.exists())
    {
      file = new File(SOLUTION_DIR + path);
    }

    String resourceContents = FileUtils.readFileToString(file);

    if (tokens != null) {
      for (final String key : tokens.keySet())
      {
        resourceContents = StringUtils.replace(resourceContents, key, tokens.get(key));
      }
    }

    // We have the resource. Should we cache it?
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension)) {
      cacheContainer.put(cacheKey, resourceContents);
    }

    return resourceContents;
  }

  private String getAbsoluteResourceAsString(final String path, final HashMap<String, String> tokens) throws
      IOException {

    final String extension = getResourceExtension(path);
    final String cacheKey = buildCacheKey(path, tokens);

    // If it's cachable and we have it, return it.
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension) && cacheContainer.containsKey(cacheKey)) {
      // return from cache. Make sure we return a clone of the original object
      return cacheContainer.get(cacheKey);
    }

    // Read file
    File file = new File(path);

    String resourceContents = FileUtils.readFileToString(file);

    if (tokens != null) {
      for (final String key : tokens.keySet())
      {
        resourceContents = StringUtils.replace(resourceContents, key, tokens.get(key));
      }
    }

    // We have the resource. Should we cache it?
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension)) {
      cacheContainer.put(cacheKey, resourceContents);
    }

    return resourceContents;
  }
  public FileOutputStream writeResource(final String path) throws IOException{

    File file = new File(PLUGIN_DIR + path);

    return new FileOutputStream(file.getPath());
  }
  public String getEncodedResourceAsString(final String path, final HashMap<String, String> tokens) throws IOException {

    final String extension = getResourceExtension(path);
    final String cacheKey = buildCacheKey(path, tokens);

    // If it's cachable and we have it, return it.
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension) && cacheContainer.containsKey(cacheKey)) {
      // return from cache. Make sure we return a clone of the original object
      //return cacheContainer.get(cacheKey);
    }

    // Read file
    File file = new File(PLUGIN_DIR + path);
    // if not under plugin dir, try saiku solution dir
    if(!file.exists())
    {
      file = new File(SOLUTION_DIR + path);
    }

    InputStream is = new FileInputStream(file);

    long length = file.length();
    if (length > Integer.MAX_VALUE) {
      // File is too large
    }
    byte[] bytes = new byte[(int)length];

    int offset = 0;
    int numRead = 0;
    while (offset < bytes.length
           && (numRead=is.read(bytes, offset, bytes.length-offset)) >= 0) {
      offset += numRead;
    }

    if (offset < bytes.length) {
      throw new IOException("Could not completely read file "+file.getName());
    }

    ObjectInputStream si = null;
    byte[] sig;
    byte[] byteArray = FileUtils.readFileToByteArray(file);
    byte[] data = null;

    final int SIZE = 2048;

    try {
      si = new ObjectInputStream(new ByteArrayInputStream(byteArray));
    } catch (IOException e) {
      e.printStackTrace();
    }

    try {
      int sigLength = si.readInt();
      sig = new byte[sigLength];
      si.read(sig);

      ByteArrayOutputStream dataStream = new ByteArrayOutputStream();
      byte[] buf = new byte[SIZE];
      int len;
      while ((len = si.read(buf)) != -1) {
        dataStream.write(buf, 0, len);
      }
      dataStream.flush();
      data = dataStream.toByteArray();
      dataStream.close();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      try {
        si.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return new String(Base64Coder.encode(data));
  }

  public String getAbsoluteEncodedResourceAsString(final String path, final HashMap<String, String> tokens) throws
      IOException {

    final String extension = getResourceExtension(path);
    final String cacheKey = buildCacheKey(path, tokens);

    // If it's cachable and we have it, return it.
    if (isCacheEnabled && CACHEABLE_EXTENSIONS.contains(extension) && cacheContainer.containsKey(cacheKey)) {
      // return from cache. Make sure we return a clone of the original object
      //return cacheContainer.get(cacheKey);
    }

    // Read file
    File file = new File(path);

    InputStream is = new FileInputStream(file);

    long length = file.length();
    if (length > Integer.MAX_VALUE) {
      // File is too large
    }
    byte[] bytes = new byte[(int)length];

    int offset = 0;
    int numRead = 0;
    while (offset < bytes.length
           && (numRead=is.read(bytes, offset, bytes.length-offset)) >= 0) {
      offset += numRead;
    }

    if (offset < bytes.length) {
      throw new IOException("Could not completely read file "+file.getName());
    }

    ObjectInputStream si = null;
    byte[] sig;
    byte[] byteArray = FileUtils.readFileToByteArray(file);
    byte[] data = null;

    final int SIZE = 2048;

    try {
      si = new ObjectInputStream(new ByteArrayInputStream(byteArray));
    } catch (IOException e) {
      e.printStackTrace();
    }

    try {
      int sigLength = si.readInt();
      sig = new byte[sigLength];
      si.read(sig);

      ByteArrayOutputStream dataStream = new ByteArrayOutputStream();
      byte[] buf = new byte[SIZE];
      int len;
      while ((len = si.read(buf)) != -1) {
        dataStream.write(buf, 0, len);
      }
      dataStream.flush();
      data = dataStream.toByteArray();
      dataStream.close();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      try {
        si.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return new String(Base64Coder.encode(data));
  }

  public String getResourceAsString(final String path) throws IOException
  {
    return getResourceAsString(path, null);
  }


  public String getAbsoluteResourceAsString(final String path) throws IOException
  {
    return getAbsoluteResourceAsString(path, null);
  }


  private String buildCacheKey(final String path, final HashMap<String, String> tokens) {

    final StringBuilder keyBuilder = new StringBuilder(path);

    if (tokens != null) {
      for (final String key : tokens.keySet()) {
        keyBuilder.append(key.hashCode());
        keyBuilder.append(tokens.get(key).hashCode());
      }
    }

    return keyBuilder.toString();
  }


  private String getResourceExtension(final String path) {

    return path.substring(path.lastIndexOf('.') + 1);

  }

  public void cleanCache() {

    cacheContainer.clear();
  }

}

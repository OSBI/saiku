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
package org.saiku.datasources.connection;

import org.apache.commons.vfs.*;
import org.apache.commons.vfs.util.RandomAccessMode;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.io.OutputStream;
import java.security.cert.Certificate;
import java.util.Map;

/**
 * RepositoryVfsFileContent/
 */
class RepositoryVfsFileContent
    implements FileContent {
  @Nullable
  private RepositoryVfsFileObject fileObject = null;
  @Nullable
  private InputStream inputStream = null;
  private boolean isOpen;
  private static final Logger LOG = LoggerFactory.getLogger(RepositoryVfsFileContent.class);

  private RepositoryVfsFileContent() {

  }

  public RepositoryVfsFileContent(RepositoryVfsFileObject repositoryVfsFileObject) {
    this.fileObject = repositoryVfsFileObject;
  }

  @Nullable
  public FileObject getFile() {
    return this.fileObject;
  }

  public long getSize()
      throws FileSystemException {
    return 0L;
  }

  public long getLastModifiedTime()
      throws FileSystemException {
    return 0L;
  }

  public void setLastModifiedTime(long l)
      throws FileSystemException {
  }

  public boolean hasAttribute(String s) {
    return false;
  }

  @Nullable
  public Map getAttributes()
      throws FileSystemException {
    return null;
  }

  @NotNull
  public String[] getAttributeNames()
      throws FileSystemException {
    return new String[0];
  }

  @Nullable
  public Object getAttribute(String s)
      throws FileSystemException {
    return null;
  }

  public void setAttribute(String s, Object o)
      throws FileSystemException {
  }

  public void removeAttribute(String s) {
  }

  @NotNull
  public Certificate[] getCertificates()
      throws FileSystemException {
    return new Certificate[0];
  }

  @Nullable
  public InputStream getInputStream()
      throws FileSystemException {
    this.inputStream = this.fileObject.getInputStream();
    this.isOpen = true;
    return this.inputStream;
  }

  @Nullable
  public OutputStream getOutputStream()
      throws FileSystemException {
    return null;
  }

  @Nullable
  public RandomAccessContent getRandomAccessContent(RandomAccessMode randomAccessMode)
      throws FileSystemException {
    return null;
  }

  @Nullable
  public OutputStream getOutputStream(boolean b)
      throws FileSystemException {
    return null;
  }

  public void close()
      throws FileSystemException {
    if (!this.isOpen) {
      return;
    }
    if (this.inputStream != null) {
      try {
        this.inputStream.close();
      } catch (Exception e) {
        LOG.error("Could not close stream", e);
      }
    }
    this.isOpen = false;
    this.fileObject.close();
  }

  @Nullable
  public FileContentInfo getContentInfo()
      throws FileSystemException {
    return null;
  }

  public boolean isOpen() {
    return false;
  }
}

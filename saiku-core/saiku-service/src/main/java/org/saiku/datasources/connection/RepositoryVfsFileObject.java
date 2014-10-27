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

import org.saiku.service.datasource.IDatasourceManager;

import org.apache.commons.vfs.*;
import org.apache.commons.vfs.operations.FileOperations;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.jcr.RepositoryException;

/**
 * RepositoryVfsFileObject.
 */
class RepositoryVfsFileObject
    implements FileObject {
  private static final Logger LOG = LoggerFactory.getLogger(RepositoryVfsFileObject.class);
  private String fileRef;
  private boolean fileInitialized;
  private RepositoryFile repositoryFile;
  private IDatasourceManager repo;
  @Nullable
  private RepositoryVfsFileContent content;
  private String fileUrl;

  private RepositoryVfsFileObject() {

  }

  public RepositoryVfsFileObject(String fileRef, IDatasourceManager repo) {
    this.repo = repo;
    this.fileRef = fileRef;
  }

  private void initFile() {
    if (!this.fileInitialized) {
      this.fileUrl = this.fileRef.replace("mondrian://", "");
      try {
        this.fileUrl = URLDecoder.decode(this.fileUrl, Charset.defaultCharset().name());
      } catch (UnsupportedEncodingException e) {
        this.fileUrl = this.fileRef;
      }
      this.repositoryFile = this.repo.getFile(this.fileUrl);

      this.fileInitialized = true;
    }
  }

  @NotNull
  public FileName getName() {
    initFile();
    FileType fileType;
    try {
      fileType = getType();
    } catch (Exception ex) {
      fileType = FileType.FOLDER;
    }
    return new RepositoryFileName(this.fileRef, fileType);
  }

  @Nullable
  public URL getURL()
      throws FileSystemException {
    return null;
  }

  public boolean exists()
      throws FileSystemException {
    initFile();
    return this.repositoryFile != null;
  }

  public boolean isHidden()
      throws FileSystemException {
    return false;
  }

  public boolean isReadable()
      throws FileSystemException {
    return exists();
  }

  public boolean isWriteable()
      throws FileSystemException {
    return false;
  }

  public FileType getType()
      throws FileSystemException {
    return this.repositoryFile != null && !this.repositoryFile.isFolder() ? FileType.FILE : FileType.FOLDER;
  }

  @Nullable
  public FileObject getParent()
      throws FileSystemException {
    return null;
  }

  @Nullable
  public FileSystem getFileSystem() {
    return null;
  }

  @Nullable
  public FileObject[] getChildren()
      throws FileSystemException {
    return null;
  }

  @Nullable
  public FileObject getChild(String s)
      throws FileSystemException {
    return null;
  }

  @Nullable
  public FileObject resolveFile(String s, NameScope nameScope)
      throws FileSystemException {
    return null;
  }

  @Nullable
  public FileObject resolveFile(String s)
      throws FileSystemException {
    return null;
  }

  @NotNull
  public FileObject[] findFiles(FileSelector fileSelector)
      throws FileSystemException {
    return new FileObject[0];
  }

  public void findFiles(FileSelector fileSelector, boolean b, List list)
      throws FileSystemException {
  }

  public boolean delete()
      throws FileSystemException {
    return false;
  }

  public int delete(FileSelector fileSelector)
      throws FileSystemException {
    return 0;
  }

  public void createFolder()
      throws FileSystemException {
  }

  public void createFile()
      throws FileSystemException {
  }

  public void copyFrom(FileObject fileObject, FileSelector fileSelector)
      throws FileSystemException {
  }

  public void moveTo(FileObject fileObject)
      throws FileSystemException {
  }

  public boolean canRenameTo(FileObject fileObject) {
    return false;
  }

  @Nullable
  public FileContent getContent()
      throws FileSystemException {
    this.content = new RepositoryVfsFileContent(this);
    return this.content;
  }

  public void close()
      throws FileSystemException {
    if (this.content != null) {
      this.content.close();
      this.content = null;
    }
  }

  public void refresh()
      throws FileSystemException {
  }

  public boolean isAttached() {
    return false;
  }

  public boolean isContentOpen() {
    return this.content != null && this.content.isOpen();
  }

  @Nullable
  public FileOperations getFileOperations()
      throws FileSystemException {
    return null;
  }

  @Nullable
  public InputStream getInputStream()
      throws FileSystemException {
    InputStream inputStream = null;
    if (exists()) {
      try {
        inputStream =
            new ByteArrayInputStream(this.repo.getInternalFileData(this.fileUrl).getBytes(StandardCharsets.UTF_8));
      } catch (RepositoryException e) {
        LOG.error("Could not create input stream", e);
      }
    }
    return inputStream;
  }
}

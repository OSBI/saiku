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

import org.jetbrains.annotations.Nullable;

import java.util.UUID;

/**
 * RepositoryFile.
 */
public class RepositoryFile {

  @Nullable
  private String path = null;
  @Nullable
  private String fileName = null;
  @Nullable
  private String fileId = null;
  private byte[] data;

  private RepositoryFile() {
  }

  public RepositoryFile(String fileName, RepositoryFile parent, byte[] data) {
    this(fileName, parent, data, System.currentTimeMillis());
  }

  public RepositoryFile(String fileName, RepositoryFile parent, String path) {
    this(fileName, null, null, System.currentTimeMillis());
    this.path = path;
  }

  private RepositoryFile(String fileName, RepositoryFile parent, byte[] data, long lastModified) {
    this();
    this.fileId = UUID.randomUUID().toString();

    this.fileName = fileName;

    setData(data);
  }

  void setData(byte[] data) {
    this.data = data;
  }

  public byte[] getData() {
    return this.data;
  }

  @Nullable
  public String getFileName() {
    return this.fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  @Nullable
  public String getFileId() {
    return this.fileId;
  }

  public void setFileId(String fileId) {
    this.fileId = fileId;
  }

  public boolean isFolder() {
    return false;
  }

  @Nullable
  public String getPath() {
    return this.path;
  }
}

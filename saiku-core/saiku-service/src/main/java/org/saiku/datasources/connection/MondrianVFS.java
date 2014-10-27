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
import org.apache.commons.vfs.impl.DefaultFileSystemManager;
import org.apache.commons.vfs.provider.FileProvider;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;

/**
 * MondrianVFS.
 */
public class MondrianVFS
    implements FileProvider {
  private IDatasourceManager datasourceManager;

  private static final Logger LOG = LoggerFactory.getLogger(MondrianVFS.class);

  public void setDatasourceManager(IDatasourceManager dms) {
    this.datasourceManager = dms;
  }

  public void init() {
    try {
      DefaultFileSystemManager dfsm = (DefaultFileSystemManager) VFS.getManager();
      if (!dfsm.hasProvider("mondrian")) {
        dfsm.addProvider("mondrian", this);
      }
    } catch (FileSystemException e) {
      LOG.error("Could not add mondrian vfs provider", e);
    }
  }

  @NotNull
  public FileObject findFile(FileObject fileObject, String catalog, FileSystemOptions fileSystemOptions)
      throws FileSystemException {
    return new RepositoryVfsFileObject(catalog, this.datasourceManager);
  }

  @Nullable
  public FileObject createFileSystem(String s, FileObject fileObject, FileSystemOptions fileSystemOptions)
      throws FileSystemException {
    return null;
  }

  @Nullable
  public FileSystemConfigBuilder getConfigBuilder() {
    return null;
  }

  @Nullable
  public Collection getCapabilities() {
    return null;
  }

  @Nullable
  public FileName parseUri(FileName fileName, String s)
      throws FileSystemException {
    return null;
  }
}

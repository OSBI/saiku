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

package org.saiku.service.datasource;

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.datasources.datasource.SaikuDatasource.Type;
import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.user.UserService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.util.*;

import javax.jcr.RepositoryException;

/**
 * ClassPathResourceDatasourceManager.
 */
public class ClassPathResourceDatasourceManager implements IDatasourceManager {

  private URL repoURL;

  private final Map<String, SaikuDatasource> datasources =
      Collections.synchronizedMap(new HashMap<String, SaikuDatasource>());

  public ClassPathResourceDatasourceManager() {

  }

  public ClassPathResourceDatasourceManager(String path) {
    try {
      setPath(path);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void setPath(String path) {

    FileSystemManager fileSystemManager;
    try {
      fileSystemManager = VFS.getManager();

      FileObject fileObject;
      fileObject = fileSystemManager.resolveFile(path);
      if (fileObject == null) {
        throw new IOException("File cannot be resolved: " + path);
      }
      if (!fileObject.exists()) {
        throw new IOException("File does not exist: " + path);
      }
      repoURL = fileObject.getURL();
      if (repoURL == null) {
        throw new Exception("Cannot load connection repository from path: " + path);
      } else {
        load();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  public void load() {
    datasources.clear();
    try {
      if (repoURL != null) {
        File[] files = new File(repoURL.getFile()).listFiles();

        for (File file : files != null ? files : new File[0]) {
          if (!file.isHidden()) {
            Properties props = new Properties();
            props.load(new FileInputStream(file));
            String name = props.getProperty("name");
            String type = props.getProperty("type");
            if (name != null && type != null) {
              Type t = SaikuDatasource.Type.valueOf(type.toUpperCase());
              SaikuDatasource ds = new SaikuDatasource(name, t, props);
              datasources.put(name, ds);
            }
          }
        }
      } else {
        throw new Exception("repo URL is null");
      }
    } catch (Exception e) {
      throw new SaikuServiceException(e.getMessage(), e);
    }
  }

  public void unload() {

  }

  @Nullable
  public SaikuDatasource addDatasource(@Nullable SaikuDatasource datasource) {
    try {
      String uri = repoURL.toURI().toString();
      if (uri != null && datasource != null) {
        uri += datasource.getName().replace(" ", "_");
        File dsFile = new File(new URI(uri));
        if (dsFile.exists()) {
          dsFile.delete();
        } else {
          dsFile.createNewFile();
        }
        FileWriter fw = new FileWriter(dsFile);
        Properties props = datasource.getProperties();
        props.store(fw, null);
        fw.close();
        datasources.put(datasource.getName(), datasource);
        return datasource;

      } else {
        throw new SaikuServiceException("Cannot save datasource because uri or datasource is null uri("
                                        + (uri == null) + ")");
      }
    } catch (Exception e) {
      throw new SaikuServiceException("Error saving datasource", e);
    }
  }

  @Nullable
  public SaikuDatasource setDatasource(SaikuDatasource datasource) {
    return addDatasource(datasource);
  }

  @NotNull
  public List<SaikuDatasource> addDatasources(@NotNull List<SaikuDatasource> datasources) {
    for (SaikuDatasource ds : datasources) {
      addDatasource(ds);
    }
    return datasources;
  }

  public boolean removeDatasource(String datasourceName) {
    try {
      String uri = repoURL.toURI().toString();
      if (uri != null) {
        // seems like we don't have to do this anymore
        //uri.toString().endsWith(String.valueOf(File.separatorChar))) {
        uri += datasourceName;
        File dsFile = new File(new URI(uri));
        if (dsFile.delete()) {
          datasources.remove(datasourceName);
          return true;
        }
      }
      throw new Exception("Cannot delete datasource file uri:" + uri);
    } catch (Exception e) {
      throw new SaikuServiceException("Cannot delete datasource", e);
    }
  }

  public boolean removeSchema(String schemaName) {
    return false;
  }

  public Map<String, SaikuDatasource> getDatasources() {
    return datasources;
  }

  public SaikuDatasource getDatasource(String datasourceName) {
    return datasources.get(datasourceName);
  }

  public void addSchema(String file, String path, String name) {

  }


  @Nullable
  public List<MondrianSchema> getMondrianSchema() {
    return null;
  }

  @Nullable
  public MondrianSchema getMondrianSchema(String catalog) {
    return null;
  }

  @Nullable
  public RepositoryFile getFile(String file) {
    return null;
  }

  @Nullable
  public String getFileData(String file, String username, List<String> roles) {
    return null;
  }

  @Nullable
  public String getInternalFileData(String file) {
    return null;
  }

  @Nullable
  public RepositoryFile getFile2(String file) {
    return null;
  }

  @Nullable
  public String getFileData(String file) {
    return null;
  }

  @Nullable
  public String saveFile(String path, String content, String user, List<String> roles) {
    return null;
  }

  @Nullable
  public String removeFile(String path, String user, List<String> roles) {
    return null;
  }

  @Nullable
  public String moveFile(String source, String target, String user, List<String> roles) {
    return null;
  }

  @Nullable
  public String saveInternalFile(String path, String content, String type) {
    return null;
  }

  @Nullable
  public String saveInternalFile(String path, String content) {
    return null;
  }

  public void removeInternalFile(String filePath) {

  }

  @Nullable
  public List<IRepositoryObject> getFiles(String type, String username, List<String> roles) {
    return null;
  }

  @Nullable
  public javax.jcr.Node getFiles() {
    return null;
  }

  public void createUser(String user) {

  }

  public void deleteFolder(String folder) {

  }

  @Nullable
  public AclEntry getACL(String object, String username, List<String> roles) {
    return null;
  }

  public void setACL(String object, String acl, String username, List<String> roles) {

  }

  public void setUserService(UserService userService) {

  }

  @Nullable
  public List<MondrianSchema> getInternalFilesOfFileType(String type) throws RepositoryException {
    return null;
  }

  public void createFileMixin(String type) throws RepositoryException {

  }

  @NotNull
  public byte[] exportRepository() {
    return new byte[0];
  }

  public void restoreRepository(byte[] data) {

  }

  public boolean hasHomeDirectory(String name) {

    return false;
  }

  public void restoreLegacyFiles(byte[] data) {

  }

  @Nullable
  public String saveFile(String path, String content, String user) {
    return null;
  }
}

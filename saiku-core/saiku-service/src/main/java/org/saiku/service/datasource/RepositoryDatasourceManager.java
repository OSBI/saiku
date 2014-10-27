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
import org.saiku.repository.*;
import org.saiku.service.importer.LegacyImporter;
import org.saiku.service.importer.impl.LegacyImporterImpl;
import org.saiku.service.user.UserService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

/**
 * A Datasource Manager for the Saiku Repository API layer.
 */
public class RepositoryDatasourceManager implements IDatasourceManager {
  private final IRepositoryManager irm = JackRabbitRepositoryManager.getJackRabbitRepositoryManager();
  private final Map<String, SaikuDatasource> datasources =
      Collections.synchronizedMap(new HashMap<String, SaikuDatasource>());
  private UserService userService;
  private static final Logger LOG = LoggerFactory.getLogger(RepositoryDatasourceManager.class);

  public void load() {
    try {
      irm.start(userService);
    } catch (RepositoryException e) {
      LOG.error("Could not start repo", e);
    }
    datasources.clear();
    try {

      List<DataSource> exporteddatasources = null;
      try {
        exporteddatasources = irm.getAllDataSources();
      } catch (RepositoryException e1) {
        LOG.error("Could not export data sources", e1);
      }

      if (exporteddatasources != null) {
        for (DataSource file : exporteddatasources) {
          if (file.getName() != null && file.getType() != null) {
            Properties props = new Properties();
            props.put("driver", file.getDriver());
            props.put("location", file.getLocation());
            props.put("username", file.getUsername());
            props.put("password", file.getPassword());
            props.put("path", file.getPath());
            props.put("id", file.getId());
            SaikuDatasource.Type t = SaikuDatasource.Type.valueOf(file.getType().toUpperCase());
            SaikuDatasource ds = new SaikuDatasource(file.getName(), t, props);
            datasources.put(file.getName(), ds);
          }
        }
      }


    } catch (Exception e) {
      throw new SaikuServiceException(e.getMessage(), e);
    }
  }

  public void unload() {
    irm.shutdown();
  }

  @NotNull
  public SaikuDatasource addDatasource(@NotNull SaikuDatasource datasource) throws Exception {
    DataSource ds = new DataSource(datasource);

    irm.saveDataSource(ds, "/datasources/" + ds.getName() + ".sds");
    datasources.put(datasource.getName(), datasource);

    return datasource;
  }

  @NotNull
  public SaikuDatasource setDatasource(@NotNull SaikuDatasource datasource) throws Exception {
    return addDatasource(datasource);
  }

  @NotNull
  public List<SaikuDatasource> addDatasources(@NotNull List<SaikuDatasource> dsources) {
    for (SaikuDatasource datasource : dsources) {
      DataSource ds = new DataSource(datasource);

      try {
        irm.saveDataSource(ds, "/datasources/" + ds.getName() + ".sds");
        datasources.put(datasource.getName(), datasource);

      } catch (RepositoryException e) {
        LOG.error("Could not add data source" + datasource.getName(), e);
      }

    }
    return dsources;
  }

  public boolean removeDatasource(String datasourceId) {
    List<DataSource> ds = null;
    try {
      ds = irm.getAllDataSources();
    } catch (RepositoryException e) {
      LOG.error("Could not get all data sources");
    }

    if (ds != null) {
      for (DataSource data : ds) {
        if (data.getId().equals(datasourceId)) {
          datasources.remove(data.getName());
          irm.deleteFile(data.getPath());
          break;
        }
      }
      return true;
    } else {
      return false;
    }


  }

  public boolean removeSchema(String schemaName) {
    List<org.saiku.database.dto.MondrianSchema> s = null;
    try {
      s = irm.getAllSchema();
    } catch (RepositoryException e) {
      LOG.error("Could not get All Schema", e);
    }

    if (s != null) {
      for (MondrianSchema data : s) {
        if (data.getName().equals(schemaName)) {
          irm.deleteFile(data.getPath());
          break;
        }
      }
      return true;
    } else {
      return false;
    }


  }

  public Map<String, SaikuDatasource> getDatasources() {
    return datasources;
  }

  public SaikuDatasource getDatasource(String datasourceName) {
    return datasources.get(datasourceName);
  }

  public void addSchema(String file, String path, String name) throws Exception {
    irm.saveFile(file, path, "admin", "nt:mondrianschema", null);

  }

  @Nullable
  public List<MondrianSchema> getMondrianSchema() {
    try {
      return irm.getAllSchema();
    } catch (RepositoryException e) {
      LOG.error("Could not get all Schema", e);
    }
    return null;
  }

  @Nullable
  public MondrianSchema getMondrianSchema(String catalog) {
    //return irm.getMondrianSchema();
    return null;
  }

  public RepositoryFile getFile(String file) {
    return irm.getFile(file);
  }


  @Nullable
  public String getFileData(String file, String username, List<String> roles) {
    try {
      return irm.getFile(file, username, roles);
    } catch (RepositoryException e) {
      LOG.error("Could not get file " + file, e);
    }
    return null;
  }

  public String getInternalFileData(String file) throws RepositoryException {

    return irm.getInternalFile(file);


  }

  @NotNull
  public String saveFile(String path, String content, String user, List<String> roles) {
    try {
      irm.saveFile(content, path, user, "nt:saikufiles", roles);
      return "Save Okay";
    } catch (RepositoryException e) {
      LOG.error("Save Failed", e);
      return "Save Failed: " + e.getLocalizedMessage();
    }
  }

  @NotNull
  public String removeFile(String path, String user, List<String> roles) {
    try {
      irm.removeFile(path, user, roles);
      return "Remove Okay";
    } catch (RepositoryException e) {
      LOG.error("Save Failed", e);
      return "Save Failed: " + e.getLocalizedMessage();
    }
  }

  @NotNull
  public String moveFile(String source, String target, String user, List<String> roles) {
    try {
      irm.moveFile(source, target, user, roles);
      return "Move Okay";
    } catch (RepositoryException e) {
      LOG.error("Move Failed", e);
      return "Move Failed: " + e.getLocalizedMessage();
    }
  }

  @NotNull
  public String saveInternalFile(String path, String content, String type) {
    try {
      irm.saveInternalFile(content, path, type);
      return "Save Okay";
    } catch (RepositoryException e) {
      e.printStackTrace();
      return "Save Failed: " + e.getLocalizedMessage();
    }
  }

  public void removeInternalFile(String filePath) {
    try {
      irm.removeInternalFile(filePath);
    } catch (RepositoryException e) {
      LOG.error("Remove file failed: " + filePath);
      e.printStackTrace();
    }
  }

  @Nullable
  public List<IRepositoryObject> getFiles(String type, String username, List<String> roles) {
    return irm.getAllFiles(type, username, roles);
  }

  public void createUser(String username) {
    try {
      irm.createUser(username);
    } catch (RepositoryException e) {
      LOG.error("Create User Failed", e);
    }
  }

  public void deleteFolder(String folder) {
    try {
      irm.deleteFolder(folder);
    } catch (RepositoryException e) {
      LOG.error("Delete User Failed", e);
    }
  }

  public AclEntry getACL(String object, String username, List<String> roles) {
    return irm.getACL(object, username, roles);
  }

  public void setACL(String object, String acl, String username, List<String> roles) {
    try {
      irm.setACL(object, acl, username, roles);
    } catch (RepositoryException e) {
      LOG.error("Set ACL Failed", e);
    }
  }


  public void setUserService(UserService userService) {
    this.userService = userService;
  }

  @Nullable
  public List<MondrianSchema> getInternalFilesOfFileType(String type) {
    try {
      return irm.getInternalFilesOfFileType(type);
    } catch (RepositoryException e) {
      LOG.error("Get internal file failed", e);
    }
    return null;
  }

  public void createFileMixin(String type) throws RepositoryException {
    irm.createFileMixin(type);
  }

  @Nullable
  public byte[] exportRepository() {
    try {
      return irm.exportRepository();

    } catch (RepositoryException e) {
      LOG.error("could not export repository", e);
    } catch (IOException e) {
      LOG.error("could not export repository IO issue", e);
    }
    return null;
  }

  public void restoreRepository(byte[] data) {
    try {
      irm.restoreRepository(data);
    } catch (Exception e) {
      LOG.error("Could not restore export", e);
    }
  }

  public boolean hasHomeDirectory(String name) {
    try {
      Node eturn = irm.getHomeFolder(name);
      return eturn != null;
    } catch (RepositoryException e) {
      LOG.error("could not get home directory");
    }
    return false;
  }

  public void restoreLegacyFiles(byte[] data) {
    LegacyImporter l = new LegacyImporterImpl(null);
    l.importLegacyReports(irm, data);
  }

  public Object getRepository() {
    return irm.getRepositoryObject();
  }
}


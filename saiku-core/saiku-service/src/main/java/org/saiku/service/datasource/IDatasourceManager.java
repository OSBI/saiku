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
import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.user.UserService;

import java.util.List;
import java.util.Map;

import javax.jcr.RepositoryException;

/**
 * IDatasourceManage
 */
public interface IDatasourceManager {

  void load();

  void unload();


  SaikuDatasource addDatasource(SaikuDatasource datasource) throws Exception;

  SaikuDatasource setDatasource(SaikuDatasource datasource) throws Exception;

  List<SaikuDatasource> addDatasources(List<SaikuDatasource> datasources);

  boolean removeDatasource(String datasourceName);

  boolean removeSchema(String schemaName);

  Map<String, SaikuDatasource> getDatasources();

  SaikuDatasource getDatasource(String datasourceName);

  void addSchema(String file, String path, String name) throws Exception;

  List<MondrianSchema> getMondrianSchema();

  MondrianSchema getMondrianSchema(String catalog);

  RepositoryFile getFile(String file);

  String getFileData(String file, String username, List<String> roles);

  String getInternalFileData(String file) throws RepositoryException;

  String saveFile(String path, String content, String user, List<String> roles);

  String removeFile(String path, String user, List<String> roles);

  String moveFile(String source, String target, String user, List<String> roles);

  String saveInternalFile(String path, String content, String type);

  void removeInternalFile(String filePath);

  List<IRepositoryObject> getFiles(String type, String username, List<String> roles);

  void createUser(String user);

  void deleteFolder(String folder);

  AclEntry getACL(String object, String username, List<String> roles);

  void setACL(String object, String acl, String username, List<String> roles);

  void setUserService(UserService userService);

  List<org.saiku.database.dto.MondrianSchema> getInternalFilesOfFileType(String type) throws RepositoryException;

  void createFileMixin(String type) throws RepositoryException;

  byte[] exportRepository();

  void restoreRepository(byte[] data);

  boolean hasHomeDirectory(String name);

  void restoreLegacyFiles(byte[] data);
}

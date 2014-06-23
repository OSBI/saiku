/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.service.datasource;

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.datasources.datasource.SaikuDatasource;

import java.util.List;
import java.util.Map;

public interface IDatasourceManager {

  public void load();

  public void unload();


  public SaikuDatasource addDatasource( SaikuDatasource datasource ) throws Exception;

  public SaikuDatasource setDatasource( SaikuDatasource datasource ) throws Exception;

  public List<SaikuDatasource> addDatasources( List<SaikuDatasource> datasources );

  public boolean removeDatasource( String datasourceName );

  public Map<String, SaikuDatasource> getDatasources();

  public SaikuDatasource getDatasource( String datasourceName );

  public void addSchema(String file, String path, String name) throws Exception;

  public List<MondrianSchema> getMondrianSchema();

  public MondrianSchema getMondrianSchema(String catalog);

  public RepositoryFile getFile(String file);

  public String getFileData(String file);

  public String saveFile(String path, String content, String user, List<String> roles);

  public javax.jcr.Node getFiles();

  public void createUser(String user);

  public void deleteFolder(String folder);
}

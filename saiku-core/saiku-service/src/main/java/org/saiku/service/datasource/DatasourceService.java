/*
* Copyright 2012 OSBI Ltd
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

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.IConnectionManager;
import org.saiku.datasources.datasource.SaikuDatasource;

public class DatasourceService implements Serializable {

  /**
   * Unique serialization UID
   */
  private static final long serialVersionUID = -4407446633148181669L;

  private IDatasourceManager datasources;

  private IConnectionManager connectionManager;

  public void setConnectionManager(IConnectionManager ic) {
    connectionManager = ic;
    datasources = ic.getDataSourceManager();
  }

  public IConnectionManager getConnectionManager() {
    return connectionManager;
  }

  public void addDatasource(SaikuDatasource datasource, boolean overwrite) throws Exception {
      SaikuDatasource ds = getDatasources().get(datasource.getName());
      if(ds == null){
          datasources.addDatasource(datasource);
      }
      else{
          if(overwrite){
              datasources.removeDatasource(ds.getName());
              datasources.addDatasource(ds);
          }
          else {
              throw new Exception("Datasource Name Already Exists!");
          }
      }

  }

  public void setDatasource(SaikuDatasource datasource) throws Exception {
    datasources.setDatasource(datasource);
  }

  public void removeDatasource(String datasourceId) {
    datasources.removeDatasource(datasourceId);
  }

  public SaikuDatasource getDatasource(String datasourceName) {
    return datasources.getDatasource(datasourceName);
  }

  public Map<String,SaikuDatasource> getDatasources() {
    return datasources.getDatasources();
  }

  public List<MondrianSchema> getAvailableSchema(){
      return datasources.getMondrianSchema();
  }

  public void addSchema(String schema, String path, String name) throws Exception {
      datasources.addSchema(schema, path, name);
  }

  public String saveFile(String content, String path, String name, List<String> roles) { return datasources.saveFile(path, content, name, roles); }

  public javax.jcr.Node getFiles() {
      return datasources.getFiles();
  }

  public String getFileData(String path){return datasources.getFileData(path); }

  public void importLegacySchema(){

  }

  public void importLegacyDatasources(){

  }

  public void importLegacyUsers(){

  }
}
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
package org.saiku.datasources.connection;

import org.olap4j.OlapConnection;
import org.saiku.service.datasource.IDatasourceManager;

import java.util.Map;

public interface IConnectionManager {

  public void setDataSourceManager( IDatasourceManager ds );

  public IDatasourceManager getDataSourceManager();

  public void refreshConnection( String name );

  public void refreshAllConnections();

  public OlapConnection getOlapConnection( String name );

  public Map<String, OlapConnection> getAllOlapConnections();

  public ISaikuConnection getConnection( String name );

  public Map<String, ISaikuConnection> getAllConnections();
}

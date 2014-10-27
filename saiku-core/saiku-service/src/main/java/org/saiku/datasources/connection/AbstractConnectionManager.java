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

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.datasource.IDatasourceProcessor;
import org.saiku.service.util.exception.SaikuServiceException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.OlapConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * AbstractConnectionManager.
 */
public abstract class AbstractConnectionManager implements IConnectionManager {


  private static final Logger LOG = LoggerFactory.getLogger(AbstractConnectionManager.class);
  private IDatasourceManager ds;

  public void setDataSourceManager(IDatasourceManager ds) {
    this.ds = ds;
  }

  public IDatasourceManager getDataSourceManager() {
    return ds;
  }

  public abstract void init() throws SaikuOlapException;

  public void destroy() throws SaikuOlapException {
    Map<String, OlapConnection> connections = getAllOlapConnections();
    if (connections != null && !connections.isEmpty()) {
      for (OlapConnection con : connections.values()) {
        try {
          if (!con.isClosed()) {
            con.close();
          }
        } catch (Exception e) {
          LOG.error("Could not close connection", e);
        }
      }
    }
    if (connections != null) {
      connections.clear();
    }
    System.out.println("Do we still have connections? : " + getAllOlapConnections().size());
  }

  @Nullable
  private SaikuDatasource preProcess(@Nullable SaikuDatasource datasource) {
    if (datasource != null && datasource.getProperties().containsKey(ISaikuConnection.DATASOURCE_PROCESSORS)) {
      datasource = datasource.clone();
      String[] processors =
          datasource.getProperties().getProperty(ISaikuConnection.DATASOURCE_PROCESSORS).split(",");
      for (String processor : processors) {
        try {
          @SuppressWarnings("unchecked")
          final Class<IDatasourceProcessor> clazz =
              (Class<IDatasourceProcessor>)
                  Class.forName(processor);
          final Constructor<IDatasourceProcessor> ctor =
              clazz.getConstructor();
          final IDatasourceProcessor dsProcessor = ctor.newInstance();
          datasource = dsProcessor.process(datasource);
        } catch (Exception e) {
          throw new SaikuServiceException("Error applying DatasourceProcessor \"" + processor + "\"", e);
        }
      }
    }
    return datasource;
  }

  private ISaikuConnection postProcess(@Nullable SaikuDatasource datasource, ISaikuConnection con) {
    if (datasource != null && datasource.getProperties().containsKey(ISaikuConnection.CONNECTION_PROCESSORS)) {
      datasource = datasource.clone();
      String[] processors =
          datasource.getProperties().getProperty(ISaikuConnection.CONNECTION_PROCESSORS).split(",");
      for (String processor : processors) {
        try {
          @SuppressWarnings("unchecked")
          final Class<IConnectionProcessor> clazz =
              (Class<IConnectionProcessor>)
                  Class.forName(processor);
          final Constructor<IConnectionProcessor> ctor =
              clazz.getConstructor();
          final IConnectionProcessor conProcessor = ctor.newInstance();
          return conProcessor.process(con);
        } catch (Exception e) {
          throw new SaikuServiceException("Error applying ConnectionProcessor \"" + processor + "\"", e);
        }
      }
    }
    return con;
  }

  @Nullable
  public ISaikuConnection getConnection(String name) throws SaikuOlapException {
    SaikuDatasource datasource = ds.getDatasource(name);
    datasource = preProcess(datasource);
    ISaikuConnection con = getInternalConnection(name, datasource);
    con = postProcess(datasource, con);
    return con;
  }

  @Nullable
  protected abstract ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource)
      throws SaikuOlapException;

  @Nullable
  protected abstract ISaikuConnection refreshInternalConnection(String name, SaikuDatasource datasource);

  public void refreshAllConnections() {
    ds.load();
    for (String name : ds.getDatasources().keySet()) {
      refreshConnection(name);
    }
  }

  public void refreshConnection(String name) {
    SaikuDatasource datasource = ds.getDatasource(name);
    datasource = preProcess(datasource);
    ISaikuConnection con = refreshInternalConnection(name, datasource);
    con = postProcess(datasource, con);
  }

  @NotNull
  public Map<String, ISaikuConnection> getAllConnections() throws SaikuOlapException {
    Map<String, ISaikuConnection> resultDs = new HashMap<String, ISaikuConnection>();
    for (String name : ds.getDatasources().keySet()) {
      ISaikuConnection con = getConnection(name);
      if (con != null) {
        resultDs.put(name, con);
      }
    }
    return resultDs;
  }

  @Nullable
  public OlapConnection getOlapConnection(String name) throws SaikuOlapException {
    ISaikuConnection con = getConnection(name);
    if (con != null) {
      Object o = con.getConnection();
      if (o != null && o instanceof OlapConnection) {
        return (OlapConnection) o;
      }
    }
    return null;
  }

  @NotNull
  public Map<String, OlapConnection> getAllOlapConnections() throws SaikuOlapException {
    Map<String, ISaikuConnection> connections = getAllConnections();
    Map<String, OlapConnection> ocons = new HashMap<String, OlapConnection>();
    for (ISaikuConnection con : connections.values()) {
      Object o = con.getConnection();
      if (o != null && o instanceof OlapConnection) {
        ocons.put(con.getName(), (OlapConnection) o);
      }
    }

    return ocons;
  }

  public boolean isDatasourceSecurity(@Nullable SaikuDatasource datasource, @Nullable String value) {
    if (datasource != null && value != null) {
      Properties props = datasource.getProperties();
      if (props != null && isDatasourceSecurityEnabled(datasource)) {
        if (props.containsKey(ISaikuConnection.SECURITY_TYPE_KEY)) {
          return props.getProperty(ISaikuConnection.SECURITY_TYPE_KEY).equals(value);
        }
      }
    }
    return false;
  }

  public boolean isDatasourceSecurityEnabled(@Nullable SaikuDatasource datasource) {
    if (datasource != null) {
      Properties props = datasource.getProperties();
      if (props != null && props.containsKey(ISaikuConnection.SECURITY_ENABLED_KEY)) {
        String enabled = props.getProperty(ISaikuConnection.SECURITY_ENABLED_KEY, "false");
        return Boolean.parseBoolean(enabled);
      }
    }
    return false;
  }
}

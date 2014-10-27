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
package org.saiku.datasources.connection.impl;

import org.saiku.datasources.connection.AbstractConnectionManager;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.olap.util.exception.SaikuOlapException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SimpleConnectionManager.
 */
public class SimpleConnectionManager extends AbstractConnectionManager {
  private Map<String, ISaikuConnection> connections = new HashMap<String, ISaikuConnection>();
  @NotNull
  private final List<String> errorConnections = new ArrayList<String>();
  private static final Logger LOG = LoggerFactory.getLogger(SimpleConnectionManager.class);


  @Override
  public void init() throws SaikuOlapException {
    this.connections = getAllConnections();
  }

  @Nullable
  @Override
  protected ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource)
      throws SaikuOlapException {

    ISaikuConnection con;

    if (!connections.containsKey(name)) {
      con = connect(name, datasource);
      if (con != null) {
        connections.put(name, con);
      } else {
        if (!errorConnections.contains(name)) {
          errorConnections.add(name);
        }
      }

    } else {
      con = connections.get(name);
    }
    return con;
  }

  @Nullable
  @Override
  protected ISaikuConnection refreshInternalConnection(String name, SaikuDatasource datasource) {
    try {
      ISaikuConnection con = connections.remove(name);
      if (con != null) {
        con.clearCache();
      }
      return getInternalConnection(name, datasource);
    } catch (Exception e) {
      LOG.error("Could not get internal connection", e);
    }
    return null;
  }

  @Nullable
  private ISaikuConnection connect(String name, @Nullable SaikuDatasource datasource) throws SaikuOlapException {
    if (datasource != null) {


      try {
        ISaikuConnection con = SaikuConnectionFactory.getConnection(datasource);
        if (con.initialized()) {
          return con;
        }
      } catch (Exception e) {
        LOG.error("Could not get connection", e);
      }

      return null;
    }

    throw new SaikuOlapException("Cannot find connection: (" + name + ")");
  }
}

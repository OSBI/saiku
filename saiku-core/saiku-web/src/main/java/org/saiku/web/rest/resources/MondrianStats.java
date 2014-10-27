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

package org.saiku.web.rest.resources;

import java.util.List;

import mondrian.olap.MondrianServer.MondrianVersion;
import mondrian.server.monitor.ConnectionInfo;
import mondrian.server.monitor.ServerInfo;
import mondrian.server.monitor.StatementInfo;

/**
 * Mondrian Stats.
 */
public class MondrianStats {

  private ServerInfo server;
  private MondrianVersion mondrianVersion;
  private int openConnectionCount;
  private int openMdxStatementCount;
  private int openSqlStatementCount;
  private int executingMdxStatementCount;
  private float avgCellDimensionality;
  private List<ConnectionInfo> connections;
  private List<StatementInfo> statements;

  public MondrianStats(
      ServerInfo server,
      MondrianVersion mv,
      int statementCurrentlyOpenCount,
      int connectionCurrentlyOpenCount,
      int sqlStatementCurrentlyOpenCount,
      int statementCurrentlyExecutingCount,
      float avgCellDimensionality,
      List<ConnectionInfo> connections,
      List<StatementInfo> statements) {

    this.server = server;
    this.mondrianVersion = mv;
    this.openConnectionCount = connectionCurrentlyOpenCount;
    this.openMdxStatementCount = statementCurrentlyOpenCount;
    this.openSqlStatementCount = sqlStatementCurrentlyOpenCount;
    this.executingMdxStatementCount = statementCurrentlyExecutingCount;
    this.avgCellDimensionality = avgCellDimensionality;
    this.connections = connections;
    this.statements = statements;


  }

  /**
   * @return the server
   */
  public ServerInfo getServer() {
    return server;
  }

  /**
   * @return the openConnectionCount
   */
  public int getOpenConnectionCount() {
    return openConnectionCount;
  }

  /**
   * @return the openMdxStatementCount
   */
  public int getOpenMdxStatementCount() {
    return openMdxStatementCount;
  }

  /**
   * @return the openSqlStatementCount
   */
  public int getOpenSqlStatementCount() {
    return openSqlStatementCount;
  }

  /**
   * @return the executingMdxStatementCount
   */
  public int getExecutingMdxStatementCount() {
    return executingMdxStatementCount;
  }

  /**
   * @return the avgCellDimensionality
   */
  public float getAvgCellDimensionality() {
    return avgCellDimensionality;
  }

  /**
   * @return the connections
   */
  public List<ConnectionInfo> getConnections() {
    return connections;
  }

  /**
   * @return the statements
   */
  public List<StatementInfo> getStatements() {
    return statements;
  }

}

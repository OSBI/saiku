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

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.OlapConnection;
import org.olap4j.OlapWrapper;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

import mondrian.rolap.RolapConnection;

import static org.saiku.datasources.connection.encrypt.CryptoUtil.decrypt;

/**
 * SaikuOlapConnection.
 */
public class SaikuOlapConnection implements ISaikuConnection {

  private final String name;
  private boolean initialized = false;
  private Properties properties;
  private OlapConnection olapConnection;

  public SaikuOlapConnection(String name, Properties props) {
    this.name = name;
    this.properties = props;
  }

  public SaikuOlapConnection(@NotNull Properties props) {
    this.properties = props;
    this.name = props.getProperty(ISaikuConnection.NAME_KEY);
  }

  public boolean connect() throws Exception {
    return connect(properties);
  }

  @Nullable
  private String decryptPassword(@Nullable String password) {

    if (password != null) {
      return decrypt(password);
    }
    return null;
  }

  public boolean connect(@NotNull Properties props) throws Exception {
    String username = props.getProperty(ISaikuConnection.USERNAME_KEY);
    String password = props.getProperty(ISaikuConnection.PASSWORD_KEY);
    String driver = props.getProperty(ISaikuConnection.DRIVER_KEY);
    String passwordenc = props.getProperty(ISaikuConnection.PASSWORD_ENCRYPT_KEY);
    this.properties = props;
    String url = props.getProperty(ISaikuConnection.URL_KEY);
    System.out.println("name:" + name);
    System.out.println("driver:" + driver);
    System.out.println("url:" + url);
    System.out.flush();


    if (passwordenc != null && passwordenc.equals("true")) {
      password = decryptPassword(password);
    }
    if (url.contains("Mondrian=4")) {
      url = url.replace("Mondrian=4; ", "");
      url = url.replace("jdbc:mondrian", "jdbc:mondrian4");
    }
    if (url.length() > 0 && url.charAt(url.length() - 1) != ';') {
      url += ";";
    }
    if (driver.equals("mondrian.olap4j.MondrianOlap4jDriver")) {
      if (username != null && username.length() > 0) {
        url += "JdbcUser=" + username + ";";
      }
      if (password != null && password.length() > 0) {
        url += "JdbcPassword=" + password + ";";
      }
    }

    Class.forName(driver);
    Connection object = DriverManager.getConnection(url, username, password);
    OlapConnection connection;
    connection = (OlapConnection) DriverManager.getConnection(url, username, password);
    final OlapWrapper wrapper = connection;
    OlapConnection tmpolapConnection = wrapper.unwrap(OlapConnection.class);


    if (tmpolapConnection == null) {
      throw new Exception("Connection is null");
    }

    System.out.println("Catalogs:" + tmpolapConnection.getOlapCatalogs().size());
    olapConnection = tmpolapConnection;
    initialized = true;
    return true;
  }

  public boolean clearCache() throws Exception {
    if (olapConnection.isWrapperFor(RolapConnection.class)) {
      System.out.println("Clearing cache");
      RolapConnection rcon = olapConnection.unwrap(RolapConnection.class);
      rcon.getCacheControl(null).flushSchemaCache();

    }
    return true;
  }


  @NotNull
  public String getDatasourceType() {
    return ISaikuConnection.OLAP_DATASOURCE;
  }

  public boolean initialized() {
    return initialized;
  }

  public Connection getConnection() {
    return olapConnection;
  }

  public void setProperties(Properties props) {
    properties = props;
  }

  public String getName() {
    return name;
  }

}

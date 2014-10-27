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

package org.saiku.database;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.importer.LegacyImporter;
import org.saiku.service.importer.impl.LegacyImporterImpl;

import org.h2.jdbcx.JdbcDataSource;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.*;
import java.util.Properties;

import javax.servlet.ServletContext;

/**
 * Database.
 */
public class Database {

  @Autowired
  ServletContext servletContext;
  private JdbcDataSource ds;
  private static final Logger LOG = LoggerFactory.getLogger(Database.class);

  private IDatasourceManager dsm;

  public Database() {

  }

  public void setDatasourceManager(IDatasourceManager dsm) {
    this.dsm = dsm;
  }

  public ServletContext getServletContext() {
    return servletContext;
  }

  public void setServletContext(ServletContext servletContext) {
    this.servletContext = servletContext;
  }

  public void init() throws SQLException {
    initDB();
    loadUsers();
    loadFoodmart();
    loadLegacyDatasources();
  }

  private void initDB() {
    String url = servletContext.getInitParameter("db.url");
    String user = servletContext.getInitParameter("db.user");
    String pword = servletContext.getInitParameter("db.password");
    ds = new JdbcDataSource();
    ds.setURL(url);
    ds.setUser(user);
    ds.setPassword(pword);
  }

  private void loadFoodmart() throws SQLException {
    String url = servletContext.getInitParameter("foodmart.url");
    String user = servletContext.getInitParameter("foodmart.user");
    String pword = servletContext.getInitParameter("foodmart.password");
    if (url != null && !url.equals("${foodmart_url}")) {
      JdbcDataSource ds2 = new JdbcDataSource();
      ds2.setURL(url);
      ds2.setUser(user);
      ds2.setPassword(pword);

      Connection c = ds2.getConnection();
      DatabaseMetaData dbm = c.getMetaData();
      ResultSet tables = dbm.getTables(null, null, "account", null);

      if (!tables.next()) {
        // Table exists
        Statement statement = c.createStatement();

        statement.execute("RUNSCRIPT FROM '../../data/foodmart_h2.sql'");
        String schema = null;
        try {
          schema = readFile("../../data/FoodMart4.xml");
        } catch (IOException e) {
          LOG.error("Can't read schema file", e);
        }
        try {
          dsm.addSchema(schema, "/datasources/foodmart4.xml", null);
        } catch (Exception e) {
          LOG.error("Can't add schema file to repo", e);
        }
        Properties p = new Properties();
        p.setProperty("driver", "mondrian.olap4j.MondrianOlap4jDriver");
        p.setProperty("location",
            "jdbc:mondrian:Jdbc=jdbc:h2:../../data/foodmart;Catalog=mondrian:///datasources/foodmart4.xml;JdbcDrivers=org.h2.Driver");
        p.setProperty("username", "sa");
        p.setProperty("password", "");
        p.setProperty("id", "4432dd20-fcae-11e3-a3ac-0800200c9a66");
        SaikuDatasource ds = new SaikuDatasource("foodmart", SaikuDatasource.Type.OLAP, p);

        try {
          dsm.addDatasource(ds);
        } catch (Exception e) {
          LOG.error("Can't add data source to reop", e);
        }
      } else {
        Statement statement = c.createStatement();

        statement.executeQuery("select 1");
      }
    }
  }

  @NotNull
  private static String readFile(@NotNull String path)
      throws IOException {
    byte[] encoded = Files.readAllBytes(Paths.get("../../data/FoodMart4.xml"));
    return new String(encoded, StandardCharsets.UTF_8);
  }

  private void loadUsers() throws SQLException {

    Connection c = ds.getConnection();

    Statement statement = c.createStatement();
    statement.execute("CREATE TABLE IF NOT EXISTS LOG(time TIMESTAMP AS CURRENT_TIMESTAMP NOT NULL, log CLOB);");

    statement.execute("CREATE TABLE IF NOT EXISTS USERS(user_id INT(11) NOT NULL AUTO_INCREMENT, "
                      + "username VARCHAR(45) NOT NULL UNIQUE, password VARCHAR(45) NOT NULL, email VARCHAR(100), "
                      + "enabled TINYINT NOT NULL DEFAULT 1, PRIMARY KEY(user_id));");

    statement.execute("CREATE TABLE IF NOT EXISTS USER_ROLES (\n"
                      + "  user_role_id INT(11) NOT NULL AUTO_INCREMENT,username VARCHAR(45),\n"
                      + "  user_id INT(11) NOT NULL REFERENCES USERS(user_id),\n"
                      + "  ROLE VARCHAR(45) NOT NULL,\n"
                      + "  PRIMARY KEY (user_role_id));");

    ResultSet result = statement.executeQuery("select count(*) as c from LOG where log = 'insert users'");
    result.next();
    if (result.getInt("c") == 0) {
      dsm.createUser("admin");
      dsm.createUser("smith");
      statement.execute("INSERT INTO users(username,password,email, enabled)\n"
                        + "VALUES ('admin','admin', 'test@admin.com',TRUE);"
                        + "INSERT INTO users(username,password,enabled)\n"
                        + "VALUES ('smith','pravah@001', TRUE);");
      statement.execute(
          "INSERT INTO user_roles (user_id, username, ROLE)\n"
          + "VALUES (1, 'admin', 'ROLE_USER');"
          + "INSERT INTO user_roles (user_id, username, ROLE)\n"
          + "VALUES (1, 'admin', 'ROLE_ADMIN');"
          + "INSERT INTO user_roles (user_id, username, ROLE)\n"
          + "VALUES (2, 'smith', 'ROLE_USER');");

      statement.execute("INSERT INTO LOG(log) VALUES('insert users');");
    }


  }

  void loadLegacyDatasources() throws SQLException {
    Connection c = ds.getConnection();

    Statement statement = c.createStatement();
    ResultSet result = statement.executeQuery("select count(*) as c from LOG where log = 'insert datasources'");

    result.next();
    if (result.getInt("c") == 0) {
      LegacyImporter l = new LegacyImporterImpl(dsm);
      l.importSchema();
      l.importDatasources();
      statement.execute("INSERT INTO LOG(log) VALUES('insert datasources');");

    }
  }
}

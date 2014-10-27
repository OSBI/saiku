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

package org.saiku.repository;

import org.saiku.datasources.datasource.SaikuDatasource;

import org.jetbrains.annotations.NotNull;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * DataSource Object
 */

@XmlRootElement
public class DataSource {

  private String encryptpassword;
  private String id;
  private String type;
  private String name;
  private String driver;
  private String location;
  private String username;
  private String password;
  private String path;

  public DataSource(@NotNull SaikuDatasource datasource) {
    this.type = datasource.getType().toString();
    this.name = datasource.getName();
    this.driver = datasource.getProperties().getProperty("driver");
    this.location = datasource.getProperties().getProperty("location");
    this.username = datasource.getProperties().getProperty("username");
    this.password = datasource.getProperties().getProperty("password");
    this.id = datasource.getProperties().getProperty("id");
    this.encryptpassword = datasource.getProperties().getProperty("encrypt.password");
  }

  public DataSource() {

  }

  public String getPassword() {
    return password;
  }

  @XmlElement
  public void setPassword(String password) {
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  @XmlElement
  public void setUsername(String username) {
    this.username = username;
  }

  public String getLocation() {
    return location;
  }

  @XmlElement
  public void setLocation(String location) {
    this.location = location;
  }

  public String getDriver() {
    return driver;
  }

  @XmlElement
  public void setDriver(String driver) {
    this.driver = driver;
  }

  public String getName() {
    return name;
  }

  @XmlElement
  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  @XmlElement
  public void setType(String type) {
    this.type = type;
  }

  public String getId() {
    return id;
  }

  @XmlElement
  public void setId(String id) {
    this.id = id;
  }

  @XmlElement
  public void setPath(String path) {
    this.path = path;
  }

  public String getPath() {
    return path;
  }

  @XmlElement
  public String getEncryptpassword() {
    return encryptpassword;
  }

  public void setEncryptpassword(String encryptpassword) {
    this.encryptpassword = encryptpassword;
  }
}

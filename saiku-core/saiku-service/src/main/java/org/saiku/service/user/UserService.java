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

package org.saiku.service.user;

import org.saiku.database.JdbcUserDAO;
import org.saiku.database.dto.SaikuUser;
import org.saiku.service.ISessionService;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.datasource.IDatasourceManager;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * UserService.
 */
public class UserService implements IUserManager, Serializable {

  private JdbcUserDAO uDAO;

  private IDatasourceManager iDatasourceManager;
  private DatasourceService datasourceService;
  private ISessionService sessionService;
  private List<String> adminRoles;

  public void setAdminRoles(List<String> adminRoles) {
    this.adminRoles = adminRoles;
  }

  public void setJdbcUserDAO(JdbcUserDAO jdbcUserDAO) {
    this.uDAO = jdbcUserDAO;
  }

  public void setiDatasourceManager(IDatasourceManager repo) {
    this.iDatasourceManager = repo;
  }


  public void setSessionService(ISessionService sessionService) {
    this.sessionService = sessionService;
  }

  public DatasourceService getDatasourceService() {
    return datasourceService;
  }

  public void setDatasourceService(DatasourceService datasourceService) {
    this.datasourceService = datasourceService;
  }

  @NotNull
  public SaikuUser addUser(@NotNull SaikuUser u) {
    uDAO.insert(u);
    uDAO.insertRole(u);
    iDatasourceManager.createUser(u.getUsername());
    return u;
  }

  public boolean deleteUser(@NotNull SaikuUser u) {
    uDAO.deleteUser(u);
    iDatasourceManager.deleteFolder("homes/home:" + u.getUsername());
    return true;
  }

  @Nullable
  public SaikuUser setUser(SaikuUser u) {
    return null;
  }

  @NotNull
  public List<SaikuUser> getUsers() {
    Collection users = uDAO.findAllUsers();
    List<SaikuUser> l = new ArrayList<SaikuUser>();
    for (Object user : users) {
      l.add((SaikuUser) user);

    }
    return l;
  }

  public SaikuUser getUser(int id) {
    return uDAO.findByUserId(id);
  }

  public String[] getRoles(SaikuUser user) {
    return uDAO.getRoles(user);
  }

  public void addRole(SaikuUser u) {
    uDAO.insertRole(u);
  }

  public void removeRole(SaikuUser u) {
    uDAO.deleteRole(u);
  }

  public void removeUser(String username) {
    SaikuUser u = getUser(Integer.parseInt(username));

    uDAO.deleteUser(username);

    iDatasourceManager.deleteFolder("homes/" + u.getUsername());

  }

  public SaikuUser updateUser(SaikuUser u) {
    SaikuUser user = uDAO.updateUser(u);
    uDAO.updateRoles(u);

    return user;

  }

  public boolean isAdmin() {
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");

    return !Collections.disjoint(roles, adminRoles);

  }

  public void checkFolders() {

    String username = (String) sessionService.getAllSessionObjects().get("username");

    boolean home = true;
    if (username != null) {
      home = datasourceService.hasHomeDirectory(username);
    }
    if (!home) {
      datasourceService.createUserHome(username);
    }


  }

  public List<String> getAdminRoles() {
    return adminRoles;
  }
}

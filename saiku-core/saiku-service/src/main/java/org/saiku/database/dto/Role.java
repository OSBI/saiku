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

package org.saiku.database.dto;

import java.util.Set;

import javax.persistence.*;

/**
 * Role.
 */
@Entity
@Table(name = "USER_ROLES")
public class Role {

  @Id
  @GeneratedValue
  private Integer id;

  private String role;

  @OneToMany(cascade = CascadeType.ALL)
  @JoinTable(name = "USER_ROLES",
      joinColumns = { @JoinColumn(name = "USER_ROLE_ID", referencedColumnName = "id") },
      inverseJoinColumns = { @JoinColumn(name = "USER_ID", referencedColumnName = "id") }
  )
  private Set<User> userRoles;

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public Set<User> getUserRoles() {
    return userRoles;
  }

  public void setUserRoles(Set<User> userRoles) {
    this.userRoles = userRoles;
  }

}

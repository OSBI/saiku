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

package org.saiku;

import org.saiku.database.dto.SaikuUser;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.Collection;

/**
 * UserDAO.
 */
public interface UserDAO {

  @NotNull
  SaikuUser insert(SaikuUser user);

  void insertRole(SaikuUser user);

  void deleteUser(SaikuUser user);

  void deleteRole(SaikuUser user);

  @Nullable
  String[] getRoles(SaikuUser user);

  @NotNull
  SaikuUser findByUserId(int userId);

  Collection findAllUsers();

  void deleteUser(String username);

  @NotNull
  SaikuUser updateUser(SaikuUser user);

  void updateRoles(SaikuUser user);
}

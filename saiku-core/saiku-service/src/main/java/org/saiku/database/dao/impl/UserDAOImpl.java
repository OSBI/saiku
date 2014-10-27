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

package org.saiku.database.dao.impl;

import org.saiku.database.dao.UserDAO;
import org.saiku.database.dto.User;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * UserDAOImpl.
 */
public class UserDAOImpl implements UserDAO {

  @Autowired
  private SessionFactory sessionFactory;

  private Session openSession() {
    return sessionFactory.getCurrentSession();
  }

  @Nullable
  public User getUser(String login) {
    List<User> userList = new ArrayList<User>();
    Query query = null; //openSession().createQuery("from User u where u.login = :login");
    query.setParameter("login", login);
    userList = query.list();
    if (userList.size() > 0) {
      return userList.get(0);
    } else {
      return null;
    }
  }

}

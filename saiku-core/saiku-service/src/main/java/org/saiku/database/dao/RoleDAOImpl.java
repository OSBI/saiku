package org.saiku.database.dao;

import org.saiku.database.dto.Role;

import org.hibernate.Session;
import org.hibernate.SessionFactory;

/**
 * Created by bugg on 01/05/14.
 */
public class RoleDAOImpl implements RoleDAO {

  private SessionFactory sessionFactory;

  private Session getCurrentSession() {
    return sessionFactory.getCurrentSession();
  }

  public Role getRole(int id) {
    Role role = (Role) getCurrentSession().load(Role.class, id);
    return role;
  }

}
package org.saiku.database.dao;

import org.saiku.database.dto.User;

/**
 * Created by bugg on 01/05/14.
 */
public interface UserDAO {
  public User getUser(String login);

}

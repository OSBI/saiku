package org.saiku.service.user;

import org.saiku.users.SaikuUser;

/**
 * Created by bugg on 01/05/14.
 */
public interface IUserManager {

  public SaikuUser addUser(SaikuUser u);

  public boolean deleteUser(SaikuUser u);

  public SaikuUser setUser(SaikuUser u);
}

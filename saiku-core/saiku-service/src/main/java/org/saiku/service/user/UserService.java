package org.saiku.service.user;

import org.saiku.users.SaikuUser;

import java.io.Serializable;
import java.util.List;

/**
 * Created by bugg on 01/05/14.
 */
public class UserService implements IUserManager, Serializable {
  public SaikuUser addUser( SaikuUser u ) {
    return null;
  }

  public boolean deleteUser( SaikuUser u ) {
    return false;
  }

  public SaikuUser setUser( SaikuUser u ) {
    return null;
  }

  public List<SaikuUser> getUsers(){
      return null;
  }

  public SaikuUser getUser( String username ){
      return null;
  }
}

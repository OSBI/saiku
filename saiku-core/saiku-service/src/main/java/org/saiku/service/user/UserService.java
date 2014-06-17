package org.saiku.service.user;

import org.saiku.database.JdbcUserDAO;
import org.saiku.database.dto.SaikuUser;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created by bugg on 01/05/14.
 */
public class UserService implements IUserManager, Serializable {

    JdbcUserDAO uDAO;

    public void setJdbcUserDAO(JdbcUserDAO jdbcUserDAO){
        this.uDAO = jdbcUserDAO;
    }
  public SaikuUser addUser( SaikuUser u ) {
      uDAO.insert(u);
      uDAO.insertRole(u);
      return u;
  }

  public boolean deleteUser( SaikuUser u ) {
       uDAO.deleteUser(u);
      return true;
  }

  public SaikuUser setUser( SaikuUser u ) {
    return null;
  }

  public List<SaikuUser> getUsers(){
      Collection users = uDAO.findAllUsers();
      List<SaikuUser> l = new ArrayList<SaikuUser>();
      for(Object user : users){
          l.add((SaikuUser)user);

      }
      return l;
  }

  public SaikuUser getUser( int id ){
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
        uDAO.deleteUser(username);
    }
}

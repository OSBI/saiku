package org.saiku.service.user;

import org.saiku.database.dto.SaikuUser;

import java.util.List;

/**
 * Created by bugg on 01/05/14.
 */
public interface IUserManager {

  public SaikuUser addUser(SaikuUser u);

  public boolean deleteUser(SaikuUser u);

  public SaikuUser setUser(SaikuUser u);

  public SaikuUser getUser(int id);

  public String[] getRoles(SaikuUser u);

  public void addRole(SaikuUser u);

  public void removeRole(SaikuUser u);

    public void removeUser(String username);

    public SaikuUser updateUser(SaikuUser u, boolean b);

    public boolean isAdmin();

    public List<String> getAdminRoles();

}

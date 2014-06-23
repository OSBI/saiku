package org.saiku;

import org.saiku.database.dto.SaikuUser;

import java.util.Collection;

/**
 * Created by bugg on 09/06/14.
 */
public interface UserDAO {

    public SaikuUser insert(SaikuUser user);
    public void insertRole(SaikuUser user);
    public void deleteUser(SaikuUser user);
    public void deleteRole(SaikuUser user);
    public String[] getRoles(SaikuUser user);
    public SaikuUser findByUserId(int userId);
    public Collection findAllUsers();
    public void deleteUser(String username);
}

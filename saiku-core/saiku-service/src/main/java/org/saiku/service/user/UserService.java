package org.saiku.service.user;

import org.saiku.database.JdbcUserDAO;
import org.saiku.database.dto.SaikuUser;
import org.saiku.service.ISessionService;
import org.saiku.service.datasource.IDatasourceManager;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * Created by bugg on 01/05/14.
 */
public class UserService implements IUserManager, Serializable {

    JdbcUserDAO uDAO;

    IDatasourceManager iDatasourceManager;
    private ISessionService sessionService;
    private List<String> adminRoles;

    public void setAdminRoles( List<String> adminRoles ) {
        this.adminRoles = adminRoles;
    }

    public void setJdbcUserDAO(JdbcUserDAO jdbcUserDAO) {
        this.uDAO = jdbcUserDAO;
    }

    public void setiDatasourceManager(IDatasourceManager repo) {
        this.iDatasourceManager = repo;
    }


    public void setSessionService(ISessionService sessionService){
        this.sessionService = sessionService;
    }

    public SaikuUser addUser(SaikuUser u) {
        uDAO.insert(u);
        uDAO.insertRole(u);
        iDatasourceManager.createUser(u.getUsername());
        return u;
    }

    public boolean deleteUser(SaikuUser u) {
        uDAO.deleteUser(u);
        iDatasourceManager.deleteFolder("homes/home:" + u.getUsername());
        return true;
    }

    public SaikuUser setUser(SaikuUser u) {
        return null;
    }

    public List<SaikuUser> getUsers() {
        Collection users = uDAO.findAllUsers();
        List<SaikuUser> l = new ArrayList<SaikuUser>();
        for (Object user : users) {
            l.add((SaikuUser) user);

        }
        return l;
    }

    public SaikuUser getUser(int id) {
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
        SaikuUser u = getUser(Integer.parseInt(username));

        uDAO.deleteUser(username);

        iDatasourceManager.deleteFolder("homes/" + u.getUsername());

    }

    public SaikuUser updateUser(SaikuUser u) {
        SaikuUser user = uDAO.updateUser(u);
        uDAO.updateRoles(u);

        return user;

    }

    public boolean isAdmin() {
        List<String> roles = (List<String> ) sessionService.getAllSessionObjects().get("roles");

        if(!Collections.disjoint(roles, adminRoles)){
            return true;
        }

        return false;
    }

    public List<String> getAdminRoles(){
        return adminRoles;
    }
}

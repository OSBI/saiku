package org.saiku.database;

import org.saiku.UserDAO;
import org.saiku.database.dto.SaikuUser;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public class JdbcUserDAO
        extends JdbcDaoSupport
        implements UserDAO
{
    BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SaikuUser insert(SaikuUser user)
    {
        String sql = "INSERT INTO users(username,password,email, enabled)\nVALUES (?,?,?,?);";

        String newsql = "SELECT MAX(USER_ID) from USERS where username = ?";
        getJdbcTemplate().update(sql, new Object[] { user.getUsername(), passwordEncoder.encode(user.getPassword()), user.getEmail(), Boolean.valueOf(true) });

        Integer name = (Integer)getJdbcTemplate().queryForObject(newsql, new Object[] { user.getUsername() }, Integer.class);

        String updatesql = "UPDATE USER_ROLES set user_id = ? where user_id = ?";

        getJdbcTemplate().update(updatesql, new Object[] { name, Integer.valueOf(user.getId()) });

        user.setId(name.intValue());

        insertRole(user);
        return user;
    }

    public void insertRole(SaikuUser user)
    {
        String sql = "INSERT INTO user_roles(user_id,username, role)\nVALUES (?,?,?);";
        String removeSQL = "DELETE FROM user_roles where user_id = ?";

        /*String[] existingroles = getRoles(user);
        List<String> bList = null;
        if ((existingroles != null) && (existingroles.length > 0))
        {
            List<String> aList = new LinkedList(Arrays.asList(existingroles));
            bList = new LinkedList(Arrays.asList(user.getRoles()));
            bList.removeAll(aList);
        }
        else
        {
            bList = Arrays.asList(user.getRoles());
        }
        for (String r : bList) {
            getJdbcTemplate().update(sql, new Object[] { Integer.valueOf(user.getId()), user.getUsername(), r });
        }*/
        getJdbcTemplate().update(removeSQL, new Object[] {user.getId()});

        for(String r: user.getRoles()) {
            if(r!=null) {
                getJdbcTemplate().update(sql, new Object[] { Integer.valueOf(user.getId()), user.getUsername(), r });
            }
        }

    }

    public void deleteUser(SaikuUser user)
    {
        String sql = "DELETE FROM USER_ROLES where USER_ID IN(SELECT USER_ID FROM USERS where USERS.USERNAME = ?);";
        String sql2 = "DELETE FROM USERS where USERNAME=?";
        getJdbcTemplate().update(sql, new Object[] { user.getUsername() });
        getJdbcTemplate().update(sql2, new Object[] { user.getUsername() });
    }

    public void deleteRole(SaikuUser user)
    {
        String role = "";
        String sql = "DELETE FROM USER_ROLES where USER_ID = ? and ROLE = ?";
        getJdbcTemplate().update(sql, new Object[] { Integer.valueOf(user.getId()), role });
    }

    public String[] getRoles(SaikuUser user)
    {
        String sql = "SELECT GROUP_CONCAT(ROLE) as ROLES from USER_ROLES where USER_ID = ?";
        String roles = (String)getJdbcTemplate().queryForObject(sql, new Object[] { Integer.valueOf(user.getId()) }, String.class);
        if (roles != null)
        {
            List<String> list = new ArrayList(Arrays.asList(roles.split(",")));
            String[] stockArr = new String[list.size()];
            return (String[])list.toArray(stockArr);
        }
        return null;
    }

    public SaikuUser findByUserId(int userId)
    {

        return (SaikuUser) getJdbcTemplate().query("select T.USER_ID, t.USERNAME, t.PASSWORD, t.email, t.ENABLED,GROUP_CONCAT(ROLE) as ROLES from USERS t " +
                "inner join (\nselect MAX(USERS.USER_ID) ID, USERS.USERNAME from USERS group by USERS.USERNAME) tm on t.USER_ID = tm.ID\n" +
                "left join (select USER_ID, ROLE from USER_ROLES) ur on t.USER_ID = ur.USER_ID where t.user_id = ? GROUP BY t.USER_ID", new Object[] { Integer.valueOf(userId) }, new UserMapper()).get(0);
    }

    public Collection findAllUsers()
    {
        return getJdbcTemplate().query("select T.USER_ID, t.USERNAME, t.PASSWORD, t.email, t.ENABLED,GROUP_CONCAT(ROLE) as ROLES from USERS t " +
                "inner join (\nselect MAX(USERS.USER_ID) ID, USERS.USERNAME from USERS group by USERS.USERNAME) tm on t.USER_ID = tm.ID\n" +
                "left join (select USER_ID, ROLE from USER_ROLES) ur on t.USER_ID = ur.USER_ID\nGROUP BY t.USER_ID", new UserMapper());
    }

    public void deleteUser(String username)
    {
        String newsql = "DELETE from USERS where USER_ID = ?";
        getJdbcTemplate().update(newsql, new Object[] { username });
    }

    public SaikuUser updateUser(SaikuUser user) {
        String sql = "UPDATE users set username = ?,password =?,email =? , enabled = ? where user_id = ?;";

        String newsql = "SELECT MAX(USER_ID) from USERS where username = ?";
        getJdbcTemplate().update(sql, new Object[] { user.getUsername(), passwordEncoder.encode(user.getPassword()), user.getEmail(),
            Boolean.valueOf(true), user.getId()});

        Integer name = (Integer)getJdbcTemplate().queryForObject(newsql, new Object[] { user.getUsername() }, Integer.class);

        String updatesql = "UPDATE USER_ROLES set user_id = ? where user_id = ?";

        getJdbcTemplate().update(updatesql, new Object[] { name, Integer.valueOf(user.getId()) });

        user.setId(name.intValue());

        insertRole(user);
        return user;
    }

    public void updateRoles(SaikuUser user) {
        insertRole(user);
    }

    private static final class UserMapper
            implements RowMapper
    {
        public Object mapRow(ResultSet rs, int rowNum)
                throws SQLException
        {
            SaikuUser user = new SaikuUser();
            user.setId(rs.getInt("user_id"));
            user.setUsername(rs.getString("username"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password"));
            if (rs.getString("ROLES") != null)
            {
                List<String> list = new ArrayList(Arrays.asList(rs.getString("ROLES").split(",")));
                String[] stockArr = new String[list.size()];
                stockArr = (String[])list.toArray(stockArr);
                user.setRoles(stockArr);
            }
            return user;
        }
    }
}
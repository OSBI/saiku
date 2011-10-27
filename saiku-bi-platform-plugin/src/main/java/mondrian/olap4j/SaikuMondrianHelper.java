package mondrian.olap4j;

import java.util.ArrayList;
import java.util.List;

import mondrian.olap.Role;
import mondrian.olap.RoleImpl;
import mondrian.olap.Schema;
import mondrian.olap.Util;
import mondrian.rolap.RolapConnection;

import org.olap4j.OlapConnection;
import org.olap4j.OlapException;

public class SaikuMondrianHelper {

	public static RolapConnection getMondrianConnection(OlapConnection con) {
		try {
			if (!(con instanceof MondrianOlap4jConnection)) {
				throw new IllegalArgumentException("Connection has to be instance of MondrianOlap4jConnection");
			}
			MondrianOlap4jConnection mcon = (MondrianOlap4jConnection) con;
			return mcon.getMondrianConnection();
		} catch (OlapException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static void setRoles(OlapConnection con, String[] roleNames) throws Exception {
		if (!(con instanceof MondrianOlap4jConnection)) {
			throw new IllegalArgumentException("Connection has to be instance of MondrianOlap4jConnection");
		}
		if (roleNames == null) {
			con.setRoleName(null);
			return;
		}
		MondrianOlap4jConnection mcon = (MondrianOlap4jConnection) con;
		RolapConnection rcon = getMondrianConnection(mcon);
		Schema schema = rcon.getSchema();
		List<Role> roleList = new ArrayList<Role>();
		Role role;
		for (String roleName : roleNames) {
			Role role1 =  schema.lookupRole(roleName);
			if (role1 == null) {
				throw Util.newError(
						"Role '" + roleName + "' not found");
			}
			roleList.add(role1);
		}
		switch (roleList.size()) {
		case 0:
			role = null;
			break;
		case 1:
			role = roleList.get(0);
			break;
		default:
			role = RoleImpl.union(roleList);
			break;
		}
		rcon.setRole(role);
	}

}

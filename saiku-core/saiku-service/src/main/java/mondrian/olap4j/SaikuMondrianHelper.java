/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package mondrian.olap4j;

import java.util.ArrayList;
import java.util.List;

import mondrian.olap.MondrianServer;
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
	
	public static MondrianServer getMondrianServer(OlapConnection con) {
		RolapConnection rcon = getMondrianConnection(con);
		return rcon != null ? rcon.getServer() : null;
	}
	
	public static boolean isMondrianConnection(OlapConnection con) {
		return (con instanceof MondrianOlap4jConnection);
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

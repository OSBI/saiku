/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package mondrian.olap4j;

import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.MetadataElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import mondrian.olap.*;
import mondrian.rolap.RolapConnection;

public class SaikuMondrianHelper {


  private static final Logger log = LoggerFactory.getLogger(SaikuMondrianHelper.class);

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

  public static boolean isMondrianDrillthrough(OlapConnection con, String mdx) {
    boolean isMondrian = isMondrianConnection(con);
    if (isMondrian) {
      RolapConnection rcon = getMondrianConnection(con);
      QueryPart qp = rcon.parseStatement(mdx);
      return (qp != null && qp instanceof DrillThrough);
    }
    return false;
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
      Role role1 = schema.lookupRole(roleName);
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


  public static boolean isMondrian(MetadataElement element) {
    return (element instanceof MondrianOlap4jMetadataElement);
  }

  public static Map<String, Annotation> getAnnotations(Level level) {
    if (isMondrian(level)) {
      MondrianOlap4jLevel mlevel = (MondrianOlap4jLevel) level;
      mondrian.olap.Level rvl = mlevel.level;
      return rvl.getAnnotationMap();
    }
    return new HashMap<String, Annotation>();
  }

  public static boolean hasAnnotation(Level level, String key) {
    Map<String, Annotation> a = getAnnotations(level);
    return a.containsKey(key);
  }

  public static ResultSet getSQLMemberLookup(OlapConnection con, String annotation, Level level, String search)
      throws SQLException {
    if (hasAnnotation(level, annotation)) {
      Map<String, Annotation> ann = getAnnotations(level);
      Annotation a = ann.get(annotation);
      String sql = a.getValue().toString();

      log.debug("Level SQLMember Lookup for " + level.getName() + " sql:[" + sql + "] parameter [" + search + "]");

      RolapConnection rcon = con.unwrap(RolapConnection.class);
      DataSource ds = rcon.getDataSource();
      Connection sqlcon = ds.getConnection();
      PreparedStatement stmt = sqlcon.prepareCall(sql);
      stmt.setString(1, search);
      ResultSet rs = stmt.executeQuery();
      return rs;
    }
    return null;

  }

//	public void getAnnotationMap(MetadataElement element) throws SQLException {
//		if (isMondrian(element)) {
//			MondrianOlap4jMetadataElement el = (MondrianOlap4jMetadataElement) element;
//			el.getOlapElement().
//			OlapElementBase base = el.unwrap(OlapElementBase.class);
//			
//					
//		}
//	}


}

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
package org.saiku.plugin;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import mondrian.olap4j.SaikuMondrianHelper;

import org.olap4j.OlapConnection;
import org.pentaho.platform.api.engine.IConnectionUserRoleMapper;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.plugin.services.connections.mondrian.MDXConnection;
import org.saiku.datasources.connection.AbstractConnectionManager;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;

public class PentahoSecurityAwareConnectionManager extends AbstractConnectionManager {

	public static final String MDX_CONNECTION_MAPPER_KEY = "Mondrian-UserRoleMapper"; //$NON-NLS-1$

	private Map<String, ISaikuConnection> connections = new HashMap<String, ISaikuConnection>();

	private final List<String> errorConnections = new ArrayList<String>();

	private boolean userAware = true;

	private boolean connectionPooling = true;

	@Override
	public void init() {
        try {
            this.connections = getAllConnections();
        }
        catch (Exception e){
            //TODO
        }	}
	
	public void setUserAware(boolean aware) {
		this.userAware = aware;
	}
	
	public void setConnectionPooling(boolean pooling) {
		this.connectionPooling = pooling;
	}

	@Override
	public void destroy() {
		if (connections != null && !connections.isEmpty()) {
			for (ISaikuConnection con : connections.values()) {
				try {
					Connection c = con.getConnection();
						if (!c.isClosed()) {
							c.close();
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}
			connections.clear();
	}
	
	@Override
	protected ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource) {
		//SolutionReposHelper.setSolutionRepositoryThreadVariable(PentahoSystem.get(ISolutionRepository.class, PentahoSessionHolder.getSession()));
		ISaikuConnection con;
		try {
			if (connectionPooling) {
				if (userAware && PentahoSessionHolder.getSession().getName() != null) {
					name = name + "-" + PentahoSessionHolder.getSession().getName();
				}
				if (!connections.containsKey(name)) {
					con =  connect(name, datasource);
					if (con != null) {
						connections.put(name, con);
					} else {
						if (!errorConnections.contains(name)) {
							errorConnections.add(name);
						}
					}
				} else {
					con = connections.get(name);
				}
			} else {
				con = connect(name, datasource);
			}

			if (con != null) {
				con = applySecurity(con, datasource);
				return con;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	protected ISaikuConnection refreshInternalConnection(String name, SaikuDatasource datasource) {
		try {
			ISaikuConnection con;
			if (connectionPooling) {
				String newname = name;
				if (userAware && PentahoSessionHolder.getSession().getName() != null) {
					newname = name + "-" + PentahoSessionHolder.getSession().getName();
				}
				con = connections.remove(newname);
			} else {
				con = getInternalConnection(name, datasource);
			}
			if (con != null) {
				con.clearCache();
			}
			con = null;
			return getInternalConnection(name, datasource);
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	private ISaikuConnection applySecurity(ISaikuConnection con, SaikuDatasource datasource) throws Exception {
		if (con == null) {
			throw new IllegalArgumentException("Cannot apply Security to NULL connection object");
		}

		if (PentahoSystem.getObjectFactory().objectDefined(MDXConnection.MDX_CONNECTION_MAPPER_KEY)) {
			IConnectionUserRoleMapper mondrianUserRoleMapper = PentahoSystem.get(IConnectionUserRoleMapper.class, MDXConnection.MDX_CONNECTION_MAPPER_KEY, null);
			if (mondrianUserRoleMapper != null) {
				OlapConnection c = (OlapConnection) con.getConnection();
				String[] validMondrianRolesForUser = mondrianUserRoleMapper.mapConnectionRoles(PentahoSessionHolder.getSession(), c.getCatalog());
				if (setRole(con, validMondrianRolesForUser, datasource)) {
					return con;
				}
			}
		}

		return con;

	}

	private boolean setRole(ISaikuConnection con, String[] validMondrianRolesForUser, SaikuDatasource datasource) {
		if (con.getConnection() instanceof OlapConnection) 
		{
			try {
				OlapConnection c = (OlapConnection) con.getConnection();
				String roles = "";
				if (validMondrianRolesForUser != null && validMondrianRolesForUser.length > 0) {
					for (String r : validMondrianRolesForUser) {
						// lets make sure the role is actually available, just to be safe
						if (c.getAvailableRoleNames().contains(r)) {
							roles += r +",";
						}
					}

					System.out.println("Setting role to datasource:" + datasource.getName() + " role: " + roles);

					if (validMondrianRolesForUser != null && validMondrianRolesForUser.length == 0) {
						return true;
					}
					else if (validMondrianRolesForUser != null && validMondrianRolesForUser.length == 1) {
						c.setRoleName(validMondrianRolesForUser[0]);
					} else {
						SaikuMondrianHelper.setRoles(c, validMondrianRolesForUser);
					}
				} else {
					c.setRoleName(null);
				}


				return true;
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return false;
	}

	private ISaikuConnection connect(String name, SaikuDatasource datasource) {
		try {
			ISaikuConnection con = SaikuConnectionFactory.getConnection(datasource);
			if (con.initialized()) {
				return con;
			}
		}
		catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}


}

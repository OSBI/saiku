package org.saiku.web.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.saiku.datasources.connection.AbstractConnectionManager;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.ISessionService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityAwareConnectionManager extends AbstractConnectionManager {

	private Map<String, ISaikuConnection> connections = new HashMap<String, ISaikuConnection>();

	private List<String> errorConnections = new ArrayList<String>();

	private ISessionService sessionService;

	public void setSessionService(ISessionService ss) {
		this.sessionService = ss;
	}

	@Override
	public void init() {
		this.connections = getAllConnections();
	}

	@Override
	protected ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource) {

		ISaikuConnection con;
		if (isDatasourceSecurity(datasource, ISaikuConnection.SECURITY_TYPE_PASSTHROUGH_VALUE) && sessionService != null) {
			con = handlePassThrough(name, datasource);
		} else {
			if (!connections.containsKey(name)) {
				con =  connect(name, datasource);
				if (con != null) {
					connections.put(con.getName(), con);
				} else {
					if (!errorConnections.contains(name)) {
						errorConnections.add(name);
					}
				}

			} else {
				con = connections.get(name);
			}

			con = applySecurity(con, datasource);
		}
		return con;
	}

	private ISaikuConnection handlePassThrough(String name,
			SaikuDatasource datasource) {

		Map<String, Object> session = sessionService.getAllSessionObjects();
		String username = (String) session.get("username");

		if (username != null) {
			String password = (String) session.get("password");
			String newName = name + "-" + username;
			datasource.getProperties().setProperty("username",username);
			if (password != null) {
				datasource.getProperties().setProperty("password",password);
			}
			ISaikuConnection con;

			if (!connections.containsKey(newName)) {
				con =  connect(name, datasource);
				if (con != null) {
					connections.put(newName, con);
				} else {
					if (!errorConnections.contains(newName)) {
						errorConnections.add(newName);
					}
				}

			} else {
				con = connections.get(newName);
			}
			return con;
		}

		return null;
	}

	private ISaikuConnection applySecurity(ISaikuConnection con, SaikuDatasource datasource) {
		if (con == null) {
			throw new IllegalArgumentException("Cannot apply Security to NULL connection object");
		}

		if (isDatasourceSecurity(datasource, ISaikuConnection.SECURITY_TYPE_SPRING2MONDRIAN_VALUE)) {
			List<String> springRoles = getSpringRoles();
			List<String> conRoles = getConnectionRoles(con);
			String roleName = null;

			for (String sprRole : springRoles) {
				if (conRoles.contains(sprRole)) {
					if (roleName == null) {
						roleName = sprRole;
					} else {
						roleName += "," + sprRole;
					}
				}
			}

			if (setRole(con, roleName, datasource)) {
				return con;
			}

		} else if (isDatasourceSecurity(datasource, ISaikuConnection.SECURITY_TYPE_SPRINGLOOKUPMONDRIAN_VALUE)) {
			Map<String, List<String>> mapping = getRoleMapping(datasource);
			List<String> springRoles = getSpringRoles();
			String roleName = null;
			for (String sprRole : springRoles) {
				if (mapping.containsKey(sprRole)) {
					List<String> roles = mapping.get(sprRole);
					for (String role : roles) {
						if (roleName == null) {
							roleName = role;
						} else {
							roleName += "," + role;
						}

					}
				}
			}
			if (setRole(con, roleName, datasource)) {
				return con;
			}

		} 

		return con;

	}

	private boolean setRole(ISaikuConnection con, String roleName, SaikuDatasource datasource) {
		if (con.getConnection() instanceof OlapConnection) 
		{
			OlapConnection c = (OlapConnection) con.getConnection();
			System.out.println("Setting role to datasource:" + datasource.getName() + " role:" + roleName);
			try {
				c.setRoleName(roleName);
				return true;
			} catch (OlapException e) {
				e.printStackTrace();
			}
		}
		return false;
	}

	private boolean isDatasourceSecurity(SaikuDatasource datasource, String value) {
		Properties props = datasource.getProperties();
		if (props != null && props.containsKey(ISaikuConnection.SECURITY_ENABLED_KEY)) {
			String enabled = props.getProperty(ISaikuConnection.SECURITY_ENABLED_KEY, "false");
			boolean isSecurity = Boolean.parseBoolean(enabled);
			if (isSecurity) {
				if (props.containsKey(ISaikuConnection.SECURITY_TYPE_KEY)) {
					return props.getProperty(ISaikuConnection.SECURITY_TYPE_KEY).equals(value);
				}
			}
		}
		return false;
	}

	private List<String> getSpringRoles() {
		List<String> roles = new ArrayList<String>();
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
			Collection<GrantedAuthority> auths = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
			for (GrantedAuthority a : auths) {
				roles.add(a.getAuthority());
			}
		}
		return roles;
	}

	private List<String> getConnectionRoles(ISaikuConnection con) {
		if (con.getDatasourceType().equals(ISaikuConnection.OLAP_DATASOURCE) 
				&& con.getConnection() instanceof OlapConnection) 
		{
			OlapConnection c = (OlapConnection) con.getConnection();
			try {
				return c.getAvailableRoleNames();
			} catch (OlapException e) {
				e.printStackTrace();
			}
		}
		return new ArrayList<String>();
	}

	private Map<String,List<String>> getRoleMapping(SaikuDatasource datasource) {
		Map<String,List<String>> result = new HashMap<String,List<String>>();
		if (datasource.getProperties().containsKey(ISaikuConnection.SECURITY_LOOKUP_KEY)) {
			String mappings = datasource.getProperties().getProperty(ISaikuConnection.SECURITY_LOOKUP_KEY);
			if (mappings != null) {
				String[] maps = mappings.split(";");
				for (String map : maps) {
					String[] m = map.split("=");
					if (m.length == 2) {
						if (!result.containsKey(m[0])) {
							result.put(m[0], new ArrayList<String>());
						}
						result.get(m[0]).add(m[1]);
					}
				}
			}
		}
		return result;
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

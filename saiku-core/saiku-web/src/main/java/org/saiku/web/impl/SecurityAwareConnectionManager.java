package org.saiku.web.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.saiku.datasources.connection.AbstractConnectionManager;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityAwareConnectionManager extends AbstractConnectionManager {

	private Map<String, ISaikuConnection> connections = new HashMap<String, ISaikuConnection>();
	
	private List<String> errorConnections = new ArrayList<String>();

	@Override
	public void init() {
		this.connections = getAllConnections();
	}

	@Override
	protected ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource) {

		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
			Object cred = SecurityContextHolder.getContext().getAuthentication().getCredentials();
			Object princ = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			System.out.println("Principal:" + princ + " Credential: " + cred);
			Collection<GrantedAuthority> auths = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
			for (GrantedAuthority a : auths) {
				System.out.println("Auhtority:" + a.getAuthority());
			}
		}
		if (!connections.containsKey(name)) {
			ISaikuConnection con =  connect(name, datasource);
			if (con != null) {
				connections.put(con.getName(), con);
				return con;
			} else {
				if (!errorConnections.contains(name)) {
					errorConnections.add(name);
				}
			}

		} else {
			return connections.get(name);
		}
		return null;
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

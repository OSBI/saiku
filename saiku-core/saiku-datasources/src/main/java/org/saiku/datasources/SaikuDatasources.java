package org.saiku.datasources;

import java.util.HashMap;
import java.util.Map;

import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;


public class SaikuDatasources {
	
	private SaikuConnectionFactory connectionFactory;
	
	private static Map<String,ISaikuConnection> connections = new HashMap<String,ISaikuConnection>();
	
	public void setConnectionFactory(SaikuConnectionFactory conService) {
		connectionFactory = conService;
		connectionFactory.connect();
		for (ISaikuConnection con : connectionFactory.getConnections()) {
			connections.put(con.getName(),con);
		}
		
	}
	
	public Object get(String name) {
		if (connections.get(name) != null) {
			return connections.get(name).getConnection();
		}
		return null;
	}
	
	public Map<String,ISaikuConnection> getAllConnections() {
		return connections;
	}
	
	public void reload() {
		connectionFactory.connect();
	}
	

}

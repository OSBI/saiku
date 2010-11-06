package org.saiku.web;

import java.util.HashMap;
import java.util.Map;

import org.saiku.datasources.ISaikuConnection;
import org.saiku.datasources.SaikuConnectionService;


public class SaikuDatasources {
	
	SaikuConnectionService connectionService;
	
	private Map<String,Object> connections = new HashMap<String,Object>();
	
	public void setConnectionService(SaikuConnectionService conService) {
		connectionService = conService;
		connectionService.connect();
		for (ISaikuConnection con : connectionService.getConnections()) {
			connections.put(con.getName(),con.getConnection());
		}
		
	}
	

}

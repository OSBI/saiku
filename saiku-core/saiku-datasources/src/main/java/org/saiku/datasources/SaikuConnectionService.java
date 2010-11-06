package org.saiku.datasources;

import java.util.List;

public class SaikuConnectionService {
	
	List<ISaikuConnection> connections;
	
	public void setConnections(List<ISaikuConnection> _connections) {
		connections = _connections;
	}
	
	public void reload() {
		connect();
	}
	
	public void connect() {
		for (ISaikuConnection con : connections) {
			if (con.connect()) {
				
			}
		}
	}
	
	public List<ISaikuConnection> getConnections() {
		return connections;
	}

}

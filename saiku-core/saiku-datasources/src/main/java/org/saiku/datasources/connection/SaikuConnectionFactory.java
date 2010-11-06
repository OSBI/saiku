package org.saiku.datasources.connection;

import java.util.List;


public class SaikuConnectionFactory {

	List<ISaikuConnection> connections;

	public void setConnections(List<ISaikuConnection> _connections) {
		connections = _connections;
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

	public void insertConnection(ISaikuConnection connection) {
		connections.add(connection);
	}
	public void clearConnections() {
		connections.clear();
	}

}

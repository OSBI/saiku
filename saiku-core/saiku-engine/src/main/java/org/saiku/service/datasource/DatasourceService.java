package org.saiku.service.datasource;

import java.util.HashMap;
import java.util.Map;

import org.olap4j.OlapConnection;
import org.saiku.datasources.SaikuDatasources;
import org.saiku.datasources.connection.ISaikuConnection;

public class DatasourceService {
	
	private SaikuDatasources datasources;
	
	public void setDatasources(SaikuDatasources ds) {
		datasources = ds;
	}
	
	public Map<String,OlapConnection> getOlapDatasources() {
		Map<String, OlapConnection> resultDs = new HashMap<String,OlapConnection>();
		Map<String, ISaikuConnection> storedDs =  datasources.getAllConnections();
		for (ISaikuConnection con: storedDs.values()) {
			if (con.getConnection() instanceof OlapConnection) {
				resultDs.put(con.getName(), (OlapConnection)con.getConnection());
			}
			
		}
		return resultDs;
	}
	
	public OlapConnection getOlapDatasource(String name) {
		Object o = datasources.get(name);
		if (o != null && o instanceof OlapConnection) {
			return (OlapConnection) o;
		}
		return null;
	}

}

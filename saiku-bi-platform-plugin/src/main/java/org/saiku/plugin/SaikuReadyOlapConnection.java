package org.saiku.plugin;

import java.util.Properties;

import org.olap4j.OlapConnection;
import org.saiku.datasources.connection.ISaikuConnection;

public class SaikuReadyOlapConnection implements ISaikuConnection {

	private String name;
	private boolean initialized = true;
	private OlapConnection olapConnection;

	public SaikuReadyOlapConnection(String name, OlapConnection con) {
		this.olapConnection = con;
		this.name = name;
	}
	
	
	public boolean connect() throws Exception {
		return true;
	}

	
	public boolean connect(Properties props) throws Exception {
		return true;
	}

	public String getDatasourceType() {
		return ISaikuConnection.OLAP_DATASOURCE;
	}

	public boolean initialized() {
		return initialized;
	}

	public Object getConnection() {
		return olapConnection;
	}
	
	public String getName() {
		return name;
	}


	public void setProperties(Properties props) {
		// TODO Auto-generated method stub
	}

}

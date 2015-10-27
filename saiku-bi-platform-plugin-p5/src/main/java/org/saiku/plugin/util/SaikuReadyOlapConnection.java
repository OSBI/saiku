package org.saiku.plugin.util;

import org.saiku.datasources.connection.ISaikuConnection;

import org.olap4j.OlapConnection;

import java.sql.Connection;
import java.util.Properties;

import mondrian.rolap.RolapConnection;

public class SaikuReadyOlapConnection implements ISaikuConnection {

	private final String name;
	private boolean initialized = false;
	private final OlapConnection olapConnection;
	private String username;
	private String password;

	public SaikuReadyOlapConnection(String name, OlapConnection con) {
		this.name = name;
		this.olapConnection = con;
	}

	public boolean connect(Properties props) throws Exception {
		return connect();
	}

	
	public boolean connect() throws Exception {
		if (olapConnection == null) {
			throw new Exception("Connection is null");
		}

		System.out.println("Catalogs:" + olapConnection.getOlapCatalogs().size());
		initialized = true;
		return true;
	}

	public boolean clearCache() throws Exception {
		if (olapConnection.isWrapperFor(RolapConnection.class)) {
			System.out.println("Clearing cache");
			RolapConnection rcon = olapConnection.unwrap(RolapConnection.class);
			rcon.getCacheControl(null).flushSchemaCache();
		}
		return true;
	}



	public String getDatasourceType() {
		return ISaikuConnection.OLAP_DATASOURCE;
	}

	public boolean initialized() {
		return initialized;
	}

	public Connection getConnection() {
		return olapConnection;
	}

	public String getName() {
		return name;
	}

  public Properties getProperties() {
    return null;
  }

  public void setProperties(Properties props) {
		// TODO Auto-generated method stub
		
	}


}

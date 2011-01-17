package org.saiku.datasources.connection;

import java.sql.DriverManager;
import java.util.Properties;

import org.olap4j.OlapConnection;
import org.olap4j.OlapWrapper;

public class SaikuOlapConnection implements ISaikuConnection {

	private String name;
	private boolean initialized = false;
	private Properties properties;
	private OlapConnection olapConnection;

	public void setProperties(Properties props) {
		properties = props;
	}
	
	public boolean connect() {
		return connect(properties);
	}

	public boolean connect(Properties props) {
		String driver = props.getProperty(ISaikuConnection.DRIVER_KEY);
		name = props.getProperty(ISaikuConnection.NAME_KEY);
		String url = props.getProperty(ISaikuConnection.URL_KEY);
		properties = props;

		try {
			Class.forName(driver);
			OlapConnection connection;
			connection = (OlapConnection) DriverManager.getConnection(url, properties);
			final OlapWrapper wrapper = connection;
			OlapConnection tmpolapConnection = (OlapConnection) wrapper.unwrap(OlapConnection.class);
			if (tmpolapConnection == null) {
				throw new Exception("Connection is null");
			}
			olapConnection = tmpolapConnection;
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		initialized = true;
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

}

package org.saiku.datasources;

import java.sql.DriverManager;
import java.util.Properties;

import org.olap4j.OlapConnection;
import org.olap4j.OlapWrapper;

public class SaikuOlapConnection implements ISaikuConnection {

	private String name;
	private boolean initialized = false;
	private Properties properties;
	private OlapConnection olapconnection;

	public boolean connect() {
		return connect(properties);
	}

	public boolean connect(Properties props) {
		String driver = props.getProperty(ISaikuConnection.DRIVER_KEY);
		String name = props.getProperty(ISaikuConnection.NAME_KEY);
		String url = props.getProperty(ISaikuConnection.URL_KEY);
		properties = props;

		try {
			Class.forName(driver);

			OlapConnection connection;

			connection = (OlapConnection) DriverManager.getConnection(url,properties);

			final OlapWrapper wrapper = connection;

			final OlapConnection olapConnection = (OlapConnection) wrapper.unwrap(OlapConnection.class);

			if (olapConnection == null) {
				throw new Exception("Connection is null");
			}
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

	public void setProperties(Properties props) {
		properties = props;

	}

}

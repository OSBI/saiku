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
	private String username;
	private String password;

	public SaikuOlapConnection(String name, Properties props) {
		this.name = name;
		this.properties = props;
	}
	public SaikuOlapConnection(Properties props) {
		this.properties = props;
		this.name = props.getProperty(ISaikuConnection.NAME_KEY);
	}
	
	public boolean connect() {
		return connect(properties);
	}

	
	public boolean connect(Properties props) {
		this.username = props.getProperty(ISaikuConnection.USERNAME_KEY);
		this.password = props.getProperty(ISaikuConnection.PASSWORD_KEY);
		String driver = props.getProperty(ISaikuConnection.DRIVER_KEY);
		this.properties = props;
		String url = props.getProperty(ISaikuConnection.URL_KEY);

		try {
			Class.forName(driver);
			OlapConnection connection;
			connection = (OlapConnection) DriverManager.getConnection(url, username,password);
			final OlapWrapper wrapper = connection;
			OlapConnection tmpolapConnection = (OlapConnection) wrapper.unwrap(OlapConnection.class);
			System.out.println("name:" + name);
			System.out.println("driver:" + driver);
			System.out.println("url:" + url);
			
			if (tmpolapConnection == null) {
				throw new Exception("Connection is null");
			}
			System.out.println("Catalogs:" + tmpolapConnection.getMetaData().getOlapCatalogs().size());
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
	
	public void setProperties(Properties props) {
		properties = props;
	}

	public String getName() {
		return name;
	}

}

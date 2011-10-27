package org.saiku.datasources.connection;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.olap4j.OlapConnection;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceManager;

public abstract class AbstractConnectionManager implements IConnectionManager {


	private IDatasourceManager ds;

	public void setDataSourceManager(IDatasourceManager ds) {
		this.ds = ds;
	}

	public IDatasourceManager getDataSourceManager() {
		return ds;
	}

	public abstract void init();


	public ISaikuConnection getConnection(String name) {
		SaikuDatasource datasource = ds.getDatasource(name);
		return getInternalConnection(name, datasource);
	}

	protected abstract ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource);

	public Map<String, ISaikuConnection> getAllConnections() {
		Map<String, ISaikuConnection> resultDs = new HashMap<String, ISaikuConnection>();
		for (String name : ds.getDatasources().keySet()) {
			ISaikuConnection con = getConnection(name);
			if (con != null) {
				resultDs.put(name,con);
			}
		}
		return resultDs;
	}

	public OlapConnection getOlapConnection(String name) {
		ISaikuConnection con = getConnection(name);
		if (con != null) {
			Object o = con.getConnection();
			if (o != null && o instanceof OlapConnection) {
				return (OlapConnection) o;
			}
		}
		return null;
	}

	public Map<String, OlapConnection> getAllOlapConnections() {
		Map<String, ISaikuConnection> connections = getAllConnections();
		Map<String, OlapConnection> ocons = new HashMap<String, OlapConnection>();
		for (ISaikuConnection con : connections.values()) {
			Object o = con.getConnection();
			if (o != null && o instanceof OlapConnection) {
				ocons.put(con.getName(), (OlapConnection) o);
			}
		}

		return ocons;
	}

	public boolean isDatasourceSecurity(SaikuDatasource datasource, String value) {
		Properties props = datasource.getProperties();
		if (props != null && isDatasourceSecurityEnabled(datasource)) {
			if (props.containsKey(ISaikuConnection.SECURITY_TYPE_KEY)) {
				return props.getProperty(ISaikuConnection.SECURITY_TYPE_KEY).equals(value);
			}
		}
		return false;
	}

	public boolean isDatasourceSecurityEnabled(SaikuDatasource datasource) {
		Properties props = datasource.getProperties();
		if (props != null && props.containsKey(ISaikuConnection.SECURITY_ENABLED_KEY)) {
			String enabled = props.getProperty(ISaikuConnection.SECURITY_ENABLED_KEY, "false");
			boolean isSecurity = Boolean.parseBoolean(enabled);
			return isSecurity;
		}
		return false;
	}
}

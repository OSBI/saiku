package org.saiku.datasources.connection;

import java.util.HashMap;
import java.util.Map;

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
			return ocons;
		}

		return null;
	}

}

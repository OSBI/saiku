package org.saiku.datasources.connection;

import java.util.Map;

import org.olap4j.OlapConnection;
import org.saiku.service.datasource.IDatasourceManager;

public interface IConnectionManager {
	
	public void setDataSourceManager(IDatasourceManager ds);
	
	public IDatasourceManager getDataSourceManager();
	
	public OlapConnection getOlapConnection(String name);
	
	public Map<String, OlapConnection> getAllOlapConnections();
	
	public ISaikuConnection getConnection(String name);
	
	public Map<String, ISaikuConnection> getAllConnections();
}

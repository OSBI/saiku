package org.saiku;

import org.saiku.datasources.connection.IConnectionManager;
import org.saiku.datasources.connection.impl.SimpleConnectionManager;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.service.datasource.ClassPathResourceDatasourceManager;
import org.saiku.service.datasource.IDatasourceManager;


public class TestSaikuContext {
    
	private static TestSaikuContext instance;
	public static boolean DEBUG = false;
	public IDatasourceManager datasourceManager;
	public IConnectionManager connectionManager;
	public OlapMetaExplorer olapMetaExplorer;

	public TestSaikuContext() {
		setup();
	}

	private void setup() {
		this.datasourceManager = new ClassPathResourceDatasourceManager("res:saiku-datasources");
		System.out.println("Datasources: " + datasourceManager.getDatasources().keySet().size());
		
		this.connectionManager = new SimpleConnectionManager();
		this.connectionManager.setDataSourceManager(datasourceManager);
		this.connectionManager.init();
		this.olapMetaExplorer = new OlapMetaExplorer(connectionManager);
		
	}
	
	

	public static TestSaikuContext instance() {
		if (instance == null) {
			instance = new TestSaikuContext();
		}
		return instance;
	}

}

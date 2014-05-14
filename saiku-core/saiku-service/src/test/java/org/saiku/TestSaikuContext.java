/*
package org.saiku;

import org.saiku.org.saiku.datasources.connection.IConnectionManager;
import org.saiku.org.saiku.datasources.connection.impl.SimpleConnectionManager;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.ClassPathResourceDatasourceManager;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.ThinQueryService;


public class TestSaikuContext {
    
	private static TestSaikuContext instance;
	public static boolean DEBUG = false;
	public IDatasourceManager datasourceManager;
	public IConnectionManager connectionManager;
	public OlapMetaExplorer olapMetaExplorer;
	public OlapDiscoverService olapDiscoverService;
	public DatasourceService datasourceService;
	public ThinQueryService thinQueryService;

	public TestSaikuContext() throws SaikuOlapException {
		setup();
	}

	private void setup() throws SaikuOlapException {
		this.datasourceManager = new ClassPathResourceDatasourceManager("res:saiku-org.saiku.datasources");
		System.out.println("Datasources: " + datasourceManager.getDatasources().keySet().size());
		
		this.connectionManager = new SimpleConnectionManager();
		this.connectionManager.setDataSourceManager(datasourceManager);
		this.connectionManager.init();
		this.olapMetaExplorer = new OlapMetaExplorer(connectionManager);
		this.datasourceService = new DatasourceService();
		this.datasourceService.setConnectionManager(connectionManager);
		this.olapDiscoverService = new OlapDiscoverService();
		this.olapDiscoverService.setDatasourceService(datasourceService);
		this.thinQueryService = new ThinQueryService();
		thinQueryService.setOlapDiscoverService(olapDiscoverService);
	}
	
	

	public static TestSaikuContext instance() throws SaikuOlapException {
		if (instance == null) {
			instance = new TestSaikuContext();
		}
		return instance;
	}
	
	public static SaikuCube getSalesCube() {
		SaikuCube cube = new SaikuCube("test", "Sales", "Sales", "Sales", "FoodMart", "FoodMart");
		return cube;
	}

}
*/

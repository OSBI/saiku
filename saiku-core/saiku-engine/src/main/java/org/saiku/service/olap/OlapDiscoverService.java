package org.saiku.service.olap;

import java.util.List;

import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.discover.pojo.ConnectionPojo;
import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.service.datasource.DatasourceService;

public class OlapDiscoverService {
	
	private DatasourceService datasourceService;
	private OlapMetaExplorer metaExplorer;
	
	public void setDatasourceService(DatasourceService ds) {
		datasourceService = ds;
		metaExplorer = new OlapMetaExplorer(ds.getOlapDatasources());
	}
	
	public List<CubePojo> getAllCubes() {
		return metaExplorer.getAllCubePojos();
	}

	public List<ConnectionPojo> getAllConnections() {
		return metaExplorer.getAllConnectionPojos();
	}
	
}

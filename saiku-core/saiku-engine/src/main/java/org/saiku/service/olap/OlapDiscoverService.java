package org.saiku.service.olap;

import java.util.List;

import org.olap4j.metadata.Cube;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.discover.pojo.ConnectionPojo;
import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.olap.discover.pojo.ICubePojo;
import org.saiku.service.datasource.DatasourceService;

public class OlapDiscoverService {
	
	private DatasourceService datasourceService;
	private OlapMetaExplorer metaExplorer;
	
	public void setDatasourceService(DatasourceService ds) {
		datasourceService = ds;
		metaExplorer = new OlapMetaExplorer(datasourceService.getOlapDatasources());
	}
	
	public CubesListRestPojo getAllCubes() {
		return metaExplorer.getAllCubePojos();
	}

	public List<ConnectionPojo> getAllConnections() {
		return metaExplorer.getAllConnectionPojos();
	}
	
	public Cube getCube(ICubePojo cube) {
		return metaExplorer.getCube(cube);
	}
	
}

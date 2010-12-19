package org.saiku.service.olap;

import java.util.List;

import org.olap4j.metadata.Cube;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.service.datasource.DatasourceService;

public class OlapDiscoverService {
	
	private DatasourceService datasourceService;
	private OlapMetaExplorer metaExplorer;
	
	public void setDatasourceService(DatasourceService ds) {
		datasourceService = ds;
		metaExplorer = new OlapMetaExplorer(datasourceService.getOlapDatasources());
	}
	
	public List<SaikuCube> getAllCubes() {
		return metaExplorer.getAllCubes();
	}

	public List<SaikuConnection> getAllConnections() {
		return metaExplorer.getAllConnections();
	}
	
	public Cube getNativeCube(SaikuCube cube) {
		return metaExplorer.getNativeCube(cube);
	}
	
}

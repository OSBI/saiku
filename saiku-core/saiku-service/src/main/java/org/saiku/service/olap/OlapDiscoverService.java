package org.saiku.service.olap;

import java.util.List;

import org.olap4j.metadata.Cube;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
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
	
	public List<SaikuDimension> getAllDimensions(SaikuCube cube) {
		return metaExplorer.getAllDimensions(cube);
	}
	
	public List<SaikuHierarchy> getAllHierarchies(SaikuCube cube) {
		return metaExplorer.getAllHierarchies(cube);
	}
	
	public List<SaikuHierarchy> getAllHierarchies(SaikuCube cube, String dimensionName) {
		SaikuDimension dim =  metaExplorer.getDimension(cube, dimensionName);
		return dim.getHierarchies();
	}

	public List<SaikuLevel> getAllLevels(SaikuCube cube, String dimensionName, String hierarchyName) {
		return  metaExplorer.getAllLevels(cube, dimensionName, hierarchyName);
	}
	
}

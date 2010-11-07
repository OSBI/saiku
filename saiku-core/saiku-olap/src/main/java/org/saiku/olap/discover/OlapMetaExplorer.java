package org.saiku.olap.discover;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.olap4j.metadata.Catalog;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Schema;
import org.saiku.olap.discover.pojo.ConnectionPojo;
import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.olap.discover.pojo.ICubePojo;
import org.saiku.olap.discover.pojo.CubesListRestPojo.CubeRestPojo;

public class OlapMetaExplorer {

	Map<String,OlapConnection> connections = new HashMap<String,OlapConnection>();

	public OlapMetaExplorer(Map<String,OlapConnection> con) {
		connections = con;
	}

	public List<ConnectionPojo> getConnectionPojos(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		List<ConnectionPojo> connectionList = new ArrayList<ConnectionPojo>();
		if (olapcon != null) {
			for (Catalog cat : olapcon.getCatalogs()) {
				try {
					for (Schema schem : cat.getSchemas()) {
						connectionList.add(new ConnectionPojo(connectionName, cat.getName(), schem.getName()));
					}
				} catch (OlapException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
		return connectionList;

	}

	public List<ConnectionPojo> getConnectionPojos(List<String> connectionNames) {
		List<ConnectionPojo> connectionList = new ArrayList<ConnectionPojo>();
		for (String connectionName : connectionNames) {
			connectionList.addAll(getConnectionPojos(connectionName));
		}
		return connectionList;
	}

	public List<ConnectionPojo> getAllConnectionPojos() {
		List<ConnectionPojo> cubesList = new ArrayList<ConnectionPojo>();
		for (String connectionName : connections.keySet()) {
			cubesList.addAll(getConnectionPojos(connectionName));
		}
		return cubesList;
	}


	public CubesListRestPojo getCubePojos(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		CubesListRestPojo cubes = new CubesListRestPojo();
		if (olapcon != null) {
			for (Catalog cat : olapcon.getCatalogs()) {
				try {
					for (Schema schem : cat.getSchemas()) {
						for (Cube cub : schem.getCubes()) {
							cubes.addCube(new CubeRestPojo(connectionName, cat.getName(), schem.getName(), cub.getName()));
						}
					}
				} catch (OlapException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
		return cubes;

	}

	public CubesListRestPojo getCubePojos(List<String> connectionNames) {
		CubesListRestPojo cubesList = new CubesListRestPojo();
		for (String connectionName : connectionNames) {
			cubesList.getCubeList().addAll(getCubePojos(connectionName).getCubeList());
		}
		return cubesList;
	}

	public CubesListRestPojo getAllCubePojos() {
		CubesListRestPojo cubes = new CubesListRestPojo();
		for (String connectionName : connections.keySet()) {
			cubes.getCubeList().addAll(getCubePojos(connectionName).getCubeList());
		}
		return cubes;
	}

	public Cube getCube(ICubePojo cube) {
		try {
			OlapConnection con = connections.get(cube.getConnectionName());
			if (con != null ) {
				Catalog cat = con.getCatalogs().get(cube.getCatalog());
				if (cat != null) {
					Schema schema = cat.getSchemas().get(cube.getSchema());
					if (schema != null) {
						Cube cub =  schema.getCubes().get(cube.getCubeName());
						if (cub != null) {
							return cub;
						}
					}

				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	

}

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
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;

public class OlapMetaExplorer {

	Map<String,OlapConnection> connections = new HashMap<String,OlapConnection>();

	public OlapMetaExplorer(Map<String,OlapConnection> con) {
		connections = con;
	}

	public List<SaikuConnection> getConnections(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		List<SaikuConnection> connectionList = new ArrayList<SaikuConnection>();
		if (olapcon != null) {
			for (Catalog cat : olapcon.getCatalogs()) {
				try {
					for (Schema schem : cat.getSchemas()) {
						connectionList.add(new SaikuConnection(connectionName, cat.getName(), schem.getName()));
					}
				} catch (OlapException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
		return connectionList;

	}

	public List<SaikuConnection> getConnections(List<String> connectionNames) {
		List<SaikuConnection> connectionList = new ArrayList<SaikuConnection>();
		for (String connectionName : connectionNames) {
			connectionList.addAll(getConnections(connectionName));
		}
		return connectionList;
	}

	public List<SaikuConnection> getAllConnections() {
		List<SaikuConnection> cubesList = new ArrayList<SaikuConnection>();
		for (String connectionName : connections.keySet()) {
			cubesList.addAll(getConnections(connectionName));
		}
		return cubesList;
	}


	public List<SaikuCube> getCubes(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		List<SaikuCube> cubes = new ArrayList<SaikuCube>();
		if (olapcon != null) {
			for (Catalog cat : olapcon.getCatalogs()) {
				try {
					for (Schema schem : cat.getSchemas()) {
						for (Cube cub : schem.getCubes()) {
							cubes.add(new SaikuCube(connectionName, cub.getName(), cat.getName(), schem.getName()));
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

	public List<SaikuCube> getCubes(List<String> connectionNames) {
		List<SaikuCube> cubesList = new ArrayList<SaikuCube>();
		for (String connectionName : connectionNames) {
			cubesList.addAll(getCubes(connectionName));
		}
		return cubesList;
	}

	public List<SaikuCube> getAllCubes() {
		List<SaikuCube> cubes = new ArrayList<SaikuCube>();
		for (String connectionName : connections.keySet()) {
			cubes.addAll(getCubes(connectionName));
		}
		return cubes;
	}

	public Cube getCube(SaikuCube cube) {
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

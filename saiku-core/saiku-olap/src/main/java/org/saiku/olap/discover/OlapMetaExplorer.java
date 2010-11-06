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
import org.olap4j.query.Query;
import org.saiku.olap.discover.pojo.ConnectionPojo;
import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.olap.query.OlapQuery;

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


	public List<CubePojo> getCubePojos(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		List<CubePojo> cubeList = new ArrayList<CubePojo>();
		if (olapcon != null) {
			for (Catalog cat : olapcon.getCatalogs()) {
				try {
					for (Schema schem : cat.getSchemas()) {
						for (Cube cub : schem.getCubes()) {
							cubeList.add(new CubePojo(connectionName, cat.getName(), schem.getName(), cub.getName()));
						}
					}
				} catch (OlapException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

		}
		return cubeList;

	}

	public List<CubePojo> getCubePojos(List<String> connectionNames) {
		List<CubePojo> cubesList = new ArrayList<CubePojo>();
		for (String connectionName : connectionNames) {
			cubesList.addAll(getCubePojos(connectionName));
		}
		return cubesList;
	}

	public List<CubePojo> getAllCubePojos() {
		List<CubePojo> cubesList = new ArrayList<CubePojo>();
		for (String connectionName : connections.keySet()) {
			cubesList.addAll(getCubePojos(connectionName));
		}
		return cubesList;
	}

	public Cube getCube(CubePojo cube) {
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

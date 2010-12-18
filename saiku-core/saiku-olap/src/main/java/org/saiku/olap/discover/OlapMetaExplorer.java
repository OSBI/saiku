/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.olap.discover;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.olap4j.metadata.Catalog;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Dimension;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Schema;
import org.saiku.olap.dto.SaikuCatalog;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuSchema;
import org.saiku.olap.util.ObjectUtil;

public class OlapMetaExplorer {

	Map<String,OlapConnection> connections = new HashMap<String,OlapConnection>();

	public OlapMetaExplorer(Map<String,OlapConnection> con) {
		connections = con;
	}

	public SaikuConnection getConnections(String connectionName) {
		OlapConnection olapcon = connections.get(connectionName);
		SaikuConnection connection = null;
		if (olapcon != null) {
			List<SaikuCatalog> catalogs = new ArrayList<SaikuCatalog>();
			for (Catalog cat : olapcon.getCatalogs()) {
				List<SaikuSchema> schemas = new ArrayList<SaikuSchema>();
				try {
					for (Schema schem : cat.getSchemas()) {
						List<SaikuCube> cubes = new ArrayList<SaikuCube>();
						for (Cube cub : schem.getCubes()) {
							cubes.add(new SaikuCube(connectionName, cub.getName(), cat.getName(), schem.getName(), cub.getDescription()));
						}
						schemas.add(new SaikuSchema(schem.getName(),cubes));
					}
				} catch (OlapException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				catalogs.add(new SaikuCatalog(cat.getName(),schemas));
			}
			connection = new SaikuConnection(connectionName,catalogs);
		}
		return connection;

	}

	public List<SaikuConnection> getConnections(List<String> connectionNames) {
		List<SaikuConnection> connectionList = new ArrayList<SaikuConnection>();
		for (String connectionName : connectionNames) {
			connectionList.add(getConnections(connectionName));
		}
		return connectionList;
	}

	public List<SaikuConnection> getAllConnections() {
		List<SaikuConnection> cubesList = new ArrayList<SaikuConnection>();
		for (String connectionName : connections.keySet()) {
			cubesList.add(getConnections(connectionName));
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
							cubes.add(new SaikuCube(connectionName, cub.getName(), cat.getName(), schem.getName(), cub.getDescription()));
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

	public Cube getNativeCube(SaikuCube cube) {
		try {
			OlapConnection con = connections.get(cube.getConnectionName());
			if (con != null ) {
				Catalog cat = con.getCatalogs().get(cube.getCatalogName());
				if (cat != null) {
					Schema schema = cat.getSchemas().get(cube.getSchemaName());
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

	public List<SaikuDimension> getAllDimensions(SaikuCube cube) {
		Cube nativeCube = getNativeCube(cube);
		List<SaikuDimension> dimensions = ObjectUtil.convertDimensions(nativeCube.getDimensions());
		return dimensions;
	}

	public SaikuDimension getDimension(SaikuCube cube, String dimensionName) {
		Cube nativeCube = getNativeCube(cube);
		Dimension dim = nativeCube.getDimensions().get(dimensionName);
		if (dim != null) {
			SaikuDimension dimension = ObjectUtil.convert(dim);
			return dimension;
		}
		return null;
	}

	public List<SaikuHierarchy> getAllHierarchies(SaikuCube cube) {
		Cube nativeCube = getNativeCube(cube);
		List<SaikuHierarchy> hierarchies = ObjectUtil.convertHierarchies(nativeCube.getHierarchies());
		return hierarchies;
	}

	public SaikuHierarchy getHierarchy(SaikuCube cube, String hierarchyName) {
		Cube nativeCube = getNativeCube(cube);
		Hierarchy h = nativeCube.getHierarchies().get(hierarchyName);
		if (h != null) {
			SaikuHierarchy hierarchy = ObjectUtil.convert(h);
			return hierarchy;
		}
		return null;
	}
	

	public List<SaikuLevel> getAllLevels(SaikuCube cube, String dimension, String hierarchy) {
		Cube nativeCube = getNativeCube(cube);
		Dimension dim = nativeCube.getDimensions().get(dimension);
		if (dim != null) {
			Hierarchy h = dim.getHierarchies().get(hierarchy);
			if (h!= null) {
				List<SaikuLevel> levels = (ObjectUtil.convertLevels(h.getLevels()));
				return levels;
			}
		}
		return null;

	}

}

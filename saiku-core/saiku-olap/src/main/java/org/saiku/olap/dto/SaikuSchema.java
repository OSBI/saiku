package org.saiku.olap.dto;

import java.util.List;

public class SaikuSchema {
	private String schemaName;
	private List<SaikuCube> cubes;

	public SaikuSchema(String name, List<SaikuCube> cubes) {
		this.schemaName = name;
		this.cubes = cubes;
	}
	
	public String getName() {
		return schemaName;
	}

	public List<SaikuCube> getCubes() {
		return cubes;
	}


}

package org.saiku.olap.dto;

import java.util.List;

public class SaikuSchema extends AbstractSaikuObject {

	private List<SaikuCube> cubes;

	public SaikuSchema(String name, List<SaikuCube> cubes) {
		super(name,name);
		this.cubes = cubes;
	}
	
	public List<SaikuCube> getCubes() {
		return cubes;
	}


}

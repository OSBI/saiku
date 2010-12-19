package org.saiku.olap.dto;

public class SaikuQuery {

	private SaikuCube cube;

	private String queryName;

	public SaikuQuery() {
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public SaikuQuery(String name, SaikuCube cube) {
		this.cube = cube;
		this.queryName = name;
	}

	public String getName() {
		return queryName;
	}

	public SaikuCube getCube() {
			return cube;
	}
}


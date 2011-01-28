package org.saiku.olap.dto;

public class SaikuQuery extends AbstractSaikuObject {

	private SaikuCube cube;

	public SaikuQuery() {
		super(null,null);
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public SaikuQuery(String name, SaikuCube cube) {
		super(name,name);
		this.cube = cube;
	}

	@Override
	public String getUniqueName() {
		String uniqueName = cube.getUniqueName() + ".[" + getName() + "]";
		return uniqueName;
	}
	
	public SaikuCube getCube() {
			return cube;
	}
}


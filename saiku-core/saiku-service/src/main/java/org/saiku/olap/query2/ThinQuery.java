package org.saiku.olap.query2;

import org.saiku.olap.dto.SaikuCube;

public class ThinQuery {
	
	private ThinQueryModel queryModel;
	private SaikuCube cube;
	
	public ThinQuery() {};
	
	public ThinQuery(ThinQueryModel queryModel, SaikuCube cube) {
		super();
		this.queryModel = queryModel;
		this.cube = cube;
	}

	/**
	 * @return the queryModel
	 */
	public ThinQueryModel getQueryModel() {
		return queryModel;
	}

	/**
	 * @param queryModel the queryModel to set
	 */
	public void setQueryModel(ThinQueryModel queryModel) {
		this.queryModel = queryModel;
	}

	/**
	 * @return the cube
	 */
	public SaikuCube getCube() {
		return cube;
	}

	/**
	 * @param cube the cube to set
	 */
	public void setCube(SaikuCube cube) {
		this.cube = cube;
	}
}

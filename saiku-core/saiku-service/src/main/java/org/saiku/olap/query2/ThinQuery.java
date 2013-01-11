package org.saiku.olap.query2;

import org.saiku.olap.dto.SaikuCube;

public class ThinQuery {
	
	private ThinQueryModel queryModel;
	private SaikuCube cube;
	private String mdx;
	private String name;
	
	public ThinQuery() {};
	
	public ThinQuery(String name, SaikuCube cube, ThinQueryModel queryModel) {
		super();
		this.queryModel = queryModel;
		this.cube = cube;
		this.name = name;
	}

	public ThinQuery(String name, SaikuCube cube, String mdx) {
		super();
		this.mdx = mdx;
		this.cube = cube;
		this.name = name;
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

	/**
	 * @return the mdx
	 */
	public String getMdx() {
		return mdx;
	}

	/**
	 * @param mdx the mdx to set
	 */
	public void setMdx(String mdx) {
		this.mdx = mdx;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
}

package org.saiku.olap.dto;

import java.util.List;

public class SaikuCubeMetadata {
	
	private List<SaikuDimension> dimensions;
	private List<SaikuMember> measures;

	public SaikuCubeMetadata(List<SaikuDimension> dimensions, List<SaikuMember> measures) {
		this.dimensions = dimensions;
		this.measures = measures;
	}
	

	/**
	 * @return the dimensions
	 */
	public List<SaikuDimension> getDimensions() {
		return dimensions;
	}

	/**
	 * @return the measures
	 */
	public List<SaikuMember> getMeasures() {
		return measures;
	}



}

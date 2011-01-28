package org.saiku.web.rest.objects;

import java.util.List;

import org.saiku.olap.dto.SaikuDimension;

public class AxisRestPojo  {

	/**
	 * A Axis Name.
	 */
	private String axisName;
	
	private List<SaikuDimension> dimensions;


	public AxisRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public AxisRestPojo(String axisName, List<SaikuDimension> dimensions) {
		this.axisName = axisName;
		this.dimensions = dimensions;
	}


	public String getAxisName() {
		return axisName;
	}

	public String toString() {
		return getAxisName();
	}

	
	public List<SaikuDimension> getDimensions(){
		return dimensions;
	}
}

package org.saiku.web.rest.objects;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;


/**
 * A Query Pojo for the rest interface.
 * @author pstoellberger
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="queries")
public  class QueryRestPojo {

	// TODO uncomment later
	// private CubeRestPojo cube;

	public QueryRestPojo() {
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public QueryRestPojo(String name) {
		// this.cube = cube;
		this.queryName = name;
	}

	/**
	 * A Connection Name.
	 */
	//        @XmlAttribute(name = "cube", required = false)
	//        private CubeRestPojo cube;

	/**
	 * A Cube Name.
	 */
	private String queryName;

	public String getName() {
		return queryName;
	}

	private List<AxisRestPojo> axes;
	
	public List<AxisRestPojo> getAxes() {
        return axes;
    }

    public void setAxes(List<AxisRestPojo> axes) {
        this.axes = axes;
    }

	// TODO uncomment when changed
	//	public CubeRestPojo getCube() {
	//		return cube;
	//	}

	@Override
	public String toString() {
		return getName();
	}

}

package org.saiku.web.rest.objects;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.dto.SaikuQuery;


/**
 * A Query Pojo for the rest interface.
 * @author pstoellberger
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="queries")
public  class QueryRestPojo extends AbstractRestObject {

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
	@XmlAttribute(name = "name", required = false)
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
	public String getCompareValue() {
		return getName();
	}

	@Override
	public SaikuQuery toNativeObject() {
		// TODO uncomment when changed
		// return new SaikuQuery(getName(), new SaikuCube(cube.getConnectionName(), cube.getCubeName(), cube.getCatalog(), cube.getSchema()));
		throw new UnsupportedOperationException("Not Implemented");
	}

	@Override
	public String toString() {
		return getName();
	}

}

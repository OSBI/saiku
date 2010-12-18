/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
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

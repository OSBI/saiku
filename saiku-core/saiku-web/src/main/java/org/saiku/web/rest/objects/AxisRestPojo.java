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
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.web.rest.util.RestList;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="axis")
public class AxisRestPojo extends AbstractRestObject {

	/**
	 * A Axis Name.
	 */
	@XmlAttribute(name = "axisname", required = false)
	private String axisName;
	
	@XmlElement(name = "dimensions", required = false)
	private RestList<DimensionRestPojo> dimensions;


	public AxisRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public AxisRestPojo(String axisName, RestList<DimensionRestPojo> dimensions) {
		this.axisName = axisName;
		this.dimensions = dimensions;
	}


	public String getAxisName() {
		return axisName;
	}

	@Override
	public String toNativeObject() {
		return new String(axisName);
	}

	@Override
	public String getCompareValue() {
		return getAxisName();
	}

	@Override
	public String toString() {
		return getAxisName();
	}

	
	public List<DimensionRestPojo> getDimensions(){
		return dimensions;
	}
}

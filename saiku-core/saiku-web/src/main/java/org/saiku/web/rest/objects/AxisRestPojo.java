package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="axis")
public class AxisRestPojo extends AbstractRestObject {

	/**
	 * A Axis Name.
	 */
	@XmlAttribute(name = "axisname", required = false)
	private String axisName;


	public AxisRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public AxisRestPojo(String axisName) {
		this.axisName = axisName;

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
}

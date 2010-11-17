package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="dimensions")
@XmlAccessorType(XmlAccessType.FIELD)
public class DimensionRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "dimension", required = false)
	private String dimensionName;


	public DimensionRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public DimensionRestPojo(String dimensionName) {
		this.dimensionName = dimensionName;

	}

	public String getDimensionName() {
		return dimensionName;
	}

	@Override
	public String toNativeObject() {
		return new String(dimensionName);
	}

	@Override
	public String getCompareValue() {
		return getDimensionName();
	}

	@Override
	public String toString() {
		return getDimensionName();
	}
}

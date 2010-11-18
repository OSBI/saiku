package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="hierarchies")
@XmlAccessorType(XmlAccessType.FIELD)
public class HierarchyRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "hierarchy", required = false)
	private String hierarchyName;


	public HierarchyRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public HierarchyRestPojo(String hierarchyName) {
		this.hierarchyName = hierarchyName;

	}

	public String getHierarchyName() {
		return hierarchyName;
	}

	@Override
	public String toNativeObject() {
		return new String(hierarchyName);
	}

	@Override
	public String getCompareValue() {
		return getHierarchyName();
	}

	@Override
	public String toString() {
		return getHierarchyName();
	}
}

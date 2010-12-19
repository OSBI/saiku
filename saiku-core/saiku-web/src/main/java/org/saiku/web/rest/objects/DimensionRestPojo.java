package org.saiku.web.rest.objects;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.dto.SaikuDimension;
import org.saiku.web.rest.util.RestList;
import org.saiku.web.rest.util.RestUtil;

@XmlRootElement(name="dimensions")
@XmlAccessorType(XmlAccessType.FIELD)
public class DimensionRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "name", required = false)
	private String name;
	
	@XmlAttribute(name = "uniqueName", required = false)
	private String uniqueName;
	
	@XmlAttribute(name = "caption", required = false)
	private String caption;
	
	@XmlElement(name = "hierarchies", required = false)
	private RestList<HierarchyRestPojo> hierarchies;


	public DimensionRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public DimensionRestPojo(String name, String uniqueName, String caption, RestList<HierarchyRestPojo> hierarchies) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.hierarchies = hierarchies;
	}

	public String getName() {
		return name;
	}

	public String getUniqueName() {
		return uniqueName;
	}

	public String getCaption() {
		return caption;
	}

	public List<HierarchyRestPojo> getHierarchies() {
		return hierarchies;
	}

	@Override
	public SaikuDimension toNativeObject() {
		return new SaikuDimension(name,uniqueName,caption,RestUtil.convertToSaikuHierarchies(hierarchies));
	}

	@Override
	public String getCompareValue() {
		return getName();
	}

	@Override
	public String toString() {
		return getName();
	}

}

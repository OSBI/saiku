package org.saiku.web.rest.objects;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.dto.SaikuHierarchy;

@XmlRootElement(name="hierarchies")
@XmlAccessorType(XmlAccessType.FIELD)
public class HierarchyRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "hierarchy", required = false)
	private String name;
	
	@XmlAttribute(name = "uniqueName", required = false)
	private String uniqueName;
	
	@XmlAttribute(name = "caption", required = false)
	private String caption;
	
	@XmlAttribute(name = "dimension", required = false)
	private String dimensionUniqueName;
	
	public HierarchyRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public HierarchyRestPojo(String name, String uniqueName, String caption, String dimensionUniqueName) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
	}
	
	public String getUniqueName() {
		return uniqueName;
	}
	public String getCaption() {
		return caption;
	}
	public String getDimensionUniqueName() {
		return dimensionUniqueName;
	}

	public String getName() {
		return name;
	}

	@Override
	public SaikuHierarchy toNativeObject() {
		return new SaikuHierarchy(name, uniqueName, caption, dimensionUniqueName);
	}

	@Override
	public String getCompareValue() {
		return getName();
	}

	@Override
	public String toString() {
		return getName();
	}

	public void setLevels(List<LevelRestPojo> levels) {
		
	}
}

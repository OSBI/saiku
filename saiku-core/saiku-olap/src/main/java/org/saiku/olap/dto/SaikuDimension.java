package org.saiku.olap.dto;

import java.util.List;

public class SaikuDimension {
	
	private String name;
	private String uniqueName;
	private String caption;
	
	private List<SaikuHierarchy> hierarchies;
	
	public SaikuDimension() {};
	
	public SaikuDimension(String name, String uniqueName, String caption, List<SaikuHierarchy> hierarchies) {
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
	
	public List<SaikuHierarchy> getHierarchies() {
		return hierarchies;
	}
	
	
	
	

}

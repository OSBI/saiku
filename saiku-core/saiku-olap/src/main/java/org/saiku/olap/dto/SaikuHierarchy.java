package org.saiku.olap.dto;


public class SaikuHierarchy {
	
	private String name;
	private String uniqueName;
	private String caption;
	private String dimensionUniqueName;
	
	public SaikuHierarchy(String name, String uniqueName, String caption, String dimensionUniqueName) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
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
	public String getDimensionUniqueName() {
		return dimensionUniqueName;
	}
}

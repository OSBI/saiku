package org.saiku.olap.dto;

import java.util.List;


public class SaikuHierarchy {
	
	private String name;
	private String uniqueName;
	private String caption;
	private String dimensionUniqueName;
	private List<SaikuLevel> levels;
	
	public SaikuHierarchy() {};
	
	public SaikuHierarchy(String name, String uniqueName, String caption, String dimensionUniqueName, List<SaikuLevel> levels) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
		this.levels = levels;
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
	
	public List<SaikuLevel> getLevels() {
		return levels;
	}
}

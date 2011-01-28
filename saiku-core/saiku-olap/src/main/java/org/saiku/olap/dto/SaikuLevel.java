package org.saiku.olap.dto;

import java.util.List;


public class SaikuLevel extends AbstractSaikuObject {
	
	private String caption;
	private String hierarchyUniqueName;
	private String dimensionUniqueName;
	private List<SaikuMember> members;
	
	
	public SaikuLevel(
			String name, 
			String uniqueName, 
			String caption, 
			String dimensionUniqueName, 
			String hierarchyUniqueName, 
			List<SaikuMember> members) 
	{
		super(uniqueName,name);
		this.caption = caption;
		this.hierarchyUniqueName = hierarchyUniqueName;
		this.dimensionUniqueName = dimensionUniqueName;
		this.members = members;
	}

	public String getCaption() {
		return caption;
	}
	
	public String getHierarchyUniqueName() {
		return hierarchyUniqueName;
	}
	
	public String getDimensionUniqueName() {
		return dimensionUniqueName;
	}
	
	public List<SaikuMember> getMembers() {
		return members;
	}
}

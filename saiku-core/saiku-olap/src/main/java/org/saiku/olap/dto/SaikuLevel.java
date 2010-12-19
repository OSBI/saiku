package org.saiku.olap.dto;

import java.util.List;


public class SaikuLevel {
	
	private String name;
	private String uniqueName;
	private String caption;
	private String hierarchyUniqueName;
	private List<SaikuMember> members;
	
	
	public SaikuLevel(String name, String uniqueName, String caption, String hierarchyUniqueName, List<SaikuMember> members) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.hierarchyUniqueName = hierarchyUniqueName;
		this.members = members;
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
	public String getHierarchyUniqueName() {
		return hierarchyUniqueName;
	}
	public List<SaikuMember> getMembers() {
		return members;
	}
}

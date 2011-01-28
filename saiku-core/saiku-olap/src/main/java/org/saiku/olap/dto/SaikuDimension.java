package org.saiku.olap.dto;

import java.util.List;

public class SaikuDimension extends AbstractSaikuObject {
	
	private String caption;
	
	private List<SaikuHierarchy> hierarchies;
	
	public SaikuDimension() {
		super(null,null);
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	};
	
	public SaikuDimension(String name, String uniqueName, String caption, List<SaikuHierarchy> hierarchies) {
		super(uniqueName,name);
		this.caption = caption;
		this.hierarchies = hierarchies;
	}

	public String getCaption() {
		return caption;
	}
	
	public List<SaikuHierarchy> getHierarchies() {
		return hierarchies;
	}
	
	
	
	

}

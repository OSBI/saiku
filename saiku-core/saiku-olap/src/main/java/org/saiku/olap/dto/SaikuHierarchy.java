package org.saiku.olap.dto;

import java.util.List;


public class SaikuHierarchy extends AbstractSaikuObject {
	
	private String caption;
	private String dimensionUniqueName;
	private List<SaikuLevel> levels;
	
	public SaikuHierarchy() {
		super(null,null);
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	};
	
	public SaikuHierarchy(String name, String uniqueName, String caption, String dimensionUniqueName, List<SaikuLevel> levels) {
		super(uniqueName,name);
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
		this.levels = levels;
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

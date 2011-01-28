package org.saiku.olap.dto;


public class SaikuMember extends AbstractSaikuObject {
	
	private String caption;
	private String dimensionUniqueName;
	private String levelUniqueName;
	
	public SaikuMember(String name, String uniqueName, String caption, String dimensionUniqueName, String levelUniqueName) {
		super(uniqueName,name);
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
	}

	public String getCaption() {
		return caption;
	}
	
	public String getLevelUniqueName() {
		return levelUniqueName;
	}
	
	public String getDimensionUniqueName() {
		return dimensionUniqueName;
	}
}

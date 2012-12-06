package org.saiku.olap.query2;

import java.util.ArrayList;
import java.util.List;

import org.saiku.olap.query2.common.AbstractThinQuerySet;

public class ThinLevel extends AbstractThinQuerySet {

	private String name;
	private String uniqueName;
	private String caption;
	
	private List<ThinMember> inclusions = new ArrayList<ThinMember>();
	private List<ThinMember> exclusions = new ArrayList<ThinMember>();
	
	public ThinLevel() {};
	public ThinLevel(String name, String uniqueName, String caption, List<ThinMember> inclusions, List<ThinMember> exclusions) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		if (inclusions != null) {
			this.inclusions = inclusions;	
		}
		if (exclusions != null) {
			this.exclusions = exclusions;
		}
		
	}
	@Override
	public String getName() {
		return name;
	}
	/**
	 * @return the uniqueName
	 */
	public String getUniqueName() {
		return uniqueName;
	}
	/**
	 * @param uniqueName the uniqueName to set
	 */
	public void setUniqueName(String uniqueName) {
		this.uniqueName = uniqueName;
	}
	/**
	 * @return the caption
	 */
	public String getCaption() {
		return caption;
	}
	/**
	 * @param caption the caption to set
	 */
	public void setCaption(String caption) {
		this.caption = caption;
	}
	/**
	 * @return the inclusions
	 */
	public List<ThinMember> getInclusions() {
		return inclusions;
	}
	/**
	 * @param inclusions the inclusions to set
	 */
	public void setInclusions(List<ThinMember> inclusions) {
		this.inclusions = inclusions;
	}
	/**
	 * @return the exclusions
	 */
	public List<ThinMember> getExclusions() {
		return exclusions;
	}
	/**
	 * @param exclusions the exclusions to set
	 */
	public void setExclusions(List<ThinMember> exclusions) {
		this.exclusions = exclusions;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

}

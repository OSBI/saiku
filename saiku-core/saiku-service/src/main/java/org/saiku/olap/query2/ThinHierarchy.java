package org.saiku.olap.query2;

import java.util.ArrayList;
import java.util.List;

import org.saiku.olap.query2.common.AbstractThinSortableQuerySet;

public class ThinHierarchy extends AbstractThinSortableQuerySet {

	private String name;
	private String uniqueName;
	private String caption;
	
	private List<ThinLevel> levels = new ArrayList<ThinLevel>();
	
	public ThinHierarchy() {};
	
	public ThinHierarchy(String name, String uniqueName, String caption, List<ThinLevel> levels) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		if (levels != null) {
			this.levels = levels;
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
	 * @return the levels
	 */
	public List<ThinLevel> getLevels() {
		return levels;
	}

	/**
	 * @param levels the levels to set
	 */
	public void setLevels(List<ThinLevel> levels) {
		this.levels = levels;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

}

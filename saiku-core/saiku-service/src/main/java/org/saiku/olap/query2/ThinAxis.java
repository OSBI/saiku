package org.saiku.olap.query2;

import java.util.HashMap;
import java.util.Map;

import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.common.AbstractThinSortableQuerySet;

public class ThinAxis extends AbstractThinSortableQuerySet {

	
	private AxisLocation location;
	private Map<String, ThinHierarchy> hierarchies = new HashMap<String, ThinHierarchy>();
	private boolean nonEmpty;
	
	
	public ThinAxis() {};
	
	public ThinAxis(AxisLocation location, Map<String, ThinHierarchy> hierarchies, boolean nonEmpty) {
		this.location = location;
		if (hierarchies != null) {
			this.hierarchies = hierarchies;
		}
		this.nonEmpty = nonEmpty;
	}

	@Override
	public String getName() {
		return location.toString();
	}

	/**
	 * @return the location
	 */
	public AxisLocation getLocation() {
		return location;
	}

	/**
	 * @param location the location to set
	 */
	public void setLocation(AxisLocation location) {
		this.location = location;
	}

	/**
	 * @return the hierarchies
	 */
	public Map<String, ThinHierarchy> getHierarchies() {
		return hierarchies;
	}

	/**
	 * @param hierarchies the hierarchies to set
	 */
	public void setHierarchies(Map<String, ThinHierarchy> hierarchies) {
		this.hierarchies = hierarchies;
	}

	/**
	 * @return the nonEmpty
	 */
	public boolean isNonEmpty() {
		return nonEmpty;
	}

	/**
	 * @param nonEmpty the nonEmpty to set
	 */
	public void setNonEmpty(boolean nonEmpty) {
		this.nonEmpty = nonEmpty;
	}

}

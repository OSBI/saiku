package org.saiku.olap.query2;

import org.saiku.olap.query2.common.AbstractThinQuerySet;

import java.util.ArrayList;
import java.util.List;

public class ThinLevel extends AbstractThinQuerySet {

	private String name;
	private String caption;
	private ThinSelection selection;
	private final List<String> aggregators = new ArrayList<>();

	public ThinLevel() {}

  public ThinLevel(String name, String caption, ThinSelection selections, List<String> aggregators) {
		this.name = name;
		this.caption = caption;
		this.selection = selections;
		if (aggregators != null) {
			this.aggregators.addAll(aggregators);
		}
		
	}

	@Override
	public String getName() {
		return name;
	}
	/**
	 * @return the caption
	 */
	public String getCaption() {
		return caption;
	}
	/**
	 * @return the selections
	 */
	public ThinSelection getSelection() {
		return selection;
	}
	
	public List<String> getAggregators() {
		return aggregators;
	}
}

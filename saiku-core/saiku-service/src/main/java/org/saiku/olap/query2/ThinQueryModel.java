package org.saiku.olap.query2;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ThinQueryModel {

	private Map<AxisLocation, ThinAxis> axes = new HashMap<AxisLocation, ThinAxis>();
	private boolean visualTotals = false;
	private String visualTotalsPattern;
	private ThinDetails details;
	private List<ThinCalculatedMeasure> calculatedMeasures = new ArrayList<ThinCalculatedMeasure>();
	
	public enum AxisLocation {
		FILTER,
		COLUMNS,
		ROWS,
		PAGES
	}

	/**
	 * @return the axes
	 */
	public Map<AxisLocation, ThinAxis> getAxes() {
		return axes;
	}

	/**
	 * @param axes the axes to set
	 */
	public void setAxes(Map<AxisLocation, ThinAxis> axes) {
		this.axes = axes;
	}

	/**
	 * @return the visualTotals
	 */
	public boolean isVisualTotals() {
		return visualTotals;
	}

	/**
	 * @param visualTotals the visualTotals to set
	 */
	public void setVisualTotals(boolean visualTotals) {
		this.visualTotals = visualTotals;
	}

	/**
	 * @return the visualTotalsPattern
	 */
	public String getVisualTotalsPattern() {
		return visualTotalsPattern;
	}

	/**
	 * @param visualTotalsPattern the visualTotalsPattern to set
	 */
	public void setVisualTotalsPattern(String visualTotalsPattern) {
		this.visualTotalsPattern = visualTotalsPattern;
	}

	public List<ThinCalculatedMeasure> getCalculatedMeasures() {
		return calculatedMeasures;
	}

	public void setCalculatedMeasures(List<ThinCalculatedMeasure> calculatedMeasures) {
		this.calculatedMeasures = calculatedMeasures;
	}

	public ThinDetails getDetails() {
		return details;
	}

	public void setDetails(ThinDetails details) {
		this.details = details;
	}
}

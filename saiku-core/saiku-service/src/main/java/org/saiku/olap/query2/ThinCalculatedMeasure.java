package org.saiku.olap.query2;

import java.util.Properties;


public class ThinCalculatedMeasure {
	
	private String name;
	private String uniqueName;
	private String caption;
	private Properties properties;
	private String formula;
	
	public ThinCalculatedMeasure(String name, String uniqueName, String caption, String formula, Properties properties) {
		this.uniqueName = uniqueName;
		this.formula = formula;
		this.name = name;
		this.caption = caption;
		this.properties = properties;
	}

	/**
	 * @return the uniqueName
	 */
	public String getUniqueName() {
		return uniqueName;
	}

	/**
	 * @return the name
	 */
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
	 * @return the properties
	 */
	public Properties getProperties() {
		return properties;
	}

	/**
	 * @return the formula
	 */
	public String getFormula() {
		return formula;
	}
	
	
	

}

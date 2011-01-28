package org.saiku.web.rest.objects.resultset;

import java.util.Properties;

public class Cell  {

	private String value;
	private String type;
	private Properties properties;
	private Properties metaproperties;

	
	public enum Type {
		ROW_HEADER,
		COLUMN_HEADER,
		DATA_CELL,
		EMPTY,
		UNKNOWN
	}
	
	public Cell() {
	}
	
	public Cell(String value) {
		this(value,new Properties(), new Properties(), Type.EMPTY);
	}
	
	public Cell(String value, Properties metaproperties, Properties properties, Type type) {
		this.value = value;
		this.properties = properties;
		this.metaproperties = metaproperties;
		this.type = type.toString();
	}
	
	public String getValue() {
		return value;
	}

	public Properties getProperties() {
		return properties;
	}

	public Properties getMetaproperties() {
		return metaproperties;
	}

	public String getType() {
		return type;
	}

	
	
}

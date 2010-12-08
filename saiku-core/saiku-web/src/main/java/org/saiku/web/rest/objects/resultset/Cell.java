package org.saiku.web.rest.objects.resultset;

import java.util.Properties;

import org.saiku.web.rest.objects.AbstractRestObject;

public class Cell extends AbstractRestObject {

	private String value;
	private String type;
	private Properties properties;
	private Properties metaproperties;

	
	public enum Type {
		HEADER,
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

	@Override
	public String getCompareValue() {
		return value;
	}

	@Override
	public Object toNativeObject() {
		return null;
	}

	@Override
	public String toString() {
		return value;
	}

	
	
}

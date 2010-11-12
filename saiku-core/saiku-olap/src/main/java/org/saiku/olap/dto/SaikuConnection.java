package org.saiku.olap.dto;

public class SaikuConnection {
	
	private String name;
	private String catalog;
	private String schema;

	public SaikuConnection(String name, String catalog, String schema) {
		this.name = name;
		this.catalog = catalog;
		this.schema = schema;
	}
	
	public String getName() {
		return name;
	}

	public String getCatalog() {
		return catalog;
	}

	public String getSchema() {
		return schema;
	}


}

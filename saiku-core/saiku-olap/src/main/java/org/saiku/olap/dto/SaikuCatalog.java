package org.saiku.olap.dto;

import java.util.List;

public class SaikuCatalog {
	private String catalogName;
	private List<SaikuSchema> schemas;

	public SaikuCatalog(String name, List<SaikuSchema> schemas) {
		this.catalogName = name;
		this.schemas = schemas;
	}
	
	public String getName() {
		return catalogName;
	}

	public List<SaikuSchema> getSchemas() {
		return schemas;
	}

}

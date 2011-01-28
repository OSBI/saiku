package org.saiku.olap.dto;

import java.util.List;

public class SaikuCatalog extends AbstractSaikuObject {

	private List<SaikuSchema> schemas;

	public SaikuCatalog(String name, List<SaikuSchema> schemas) {
		super(name,name);
		this.schemas = schemas;
	}
	
	public List<SaikuSchema> getSchemas() {
		return schemas;
	}

}

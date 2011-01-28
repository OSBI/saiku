package org.saiku.olap.dto;

import java.util.List;

public class SaikuConnection extends AbstractSaikuObject {
	
	private List<SaikuCatalog> catalogs;

	public SaikuConnection(){
		super(null,null);
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	public SaikuConnection(String connectionName, List<SaikuCatalog> catalogs) {
		super(connectionName,connectionName);
		this.catalogs = catalogs;
	}
	
	public List<SaikuCatalog> getCatalogs() {
		return catalogs;
	}

}

package org.saiku.olap.dto;

import java.util.List;

public class SaikuConnection {
	
	private String connectionName;
	private List<SaikuCatalog> catalogs;

	public SaikuConnection(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	public SaikuConnection(String connectionName, List<SaikuCatalog> catalogs) {
		this.connectionName = connectionName;
		this.catalogs = catalogs;
	}
	
	public String getConnectionName() {
		return connectionName;
	}

	public List<SaikuCatalog> getCatalogs() {
		return catalogs;
	}

}

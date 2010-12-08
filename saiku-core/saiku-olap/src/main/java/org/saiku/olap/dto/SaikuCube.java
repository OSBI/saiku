package org.saiku.olap.dto;




public class SaikuCube {

	private String connectionName;
	private String cubeName;
	private String catalogName;
	private String schemaName;
	private Object cubeDescription;

	public SaikuCube(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	public SaikuCube(String connectionName, String cubeName, String catalog, String schema, String description) {
		this.connectionName = connectionName;
		this.cubeName = cubeName;
		this.catalogName = catalog;
		this.schemaName = schema;
		this.cubeDescription = description;
	}

	public String getCatalogName() {
		return catalogName;
	}
	public String getConnectionName() {
		return connectionName;
	}
	public String getCubeName() {
		return cubeName;
	}
	public Object getCubeDescription() {
		return cubeDescription;
	}
	public String getSchemaName() {
		return schemaName;
	}
}


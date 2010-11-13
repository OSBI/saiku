package org.saiku.olap.dto;




public class SaikuCube {

	private String connectionName;
	private String cubeName;
	private String catalog;
	private String schema;

	public SaikuCube(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	public SaikuCube(String connectionName, String cubeName, String catalog, String schema) {
		this.connectionName = connectionName;
		this.cubeName = cubeName;
		this.catalog = catalog;
		this.schema = schema;
	}

	public String getCatalog() {
		return catalog;
	}
	public String getConnectionName() {
		return connectionName;
	}
	public String getCubeName() {
		return cubeName;
	}
	public String getSchema() {
		return schema;
	}
}


package org.saiku.olap.discover.pojo;

public class CubePojo implements ICubePojo{
	
	private String connectionName;
	private String cubeName;
	private String catalog;
	private String schema;

	public CubePojo(String _connectionName, String _catalog, String _schema, String _cubeName) {
		connectionName = _connectionName;
		catalog = _catalog;
		schema = _schema;
		cubeName = _cubeName;
	}
	
	public String getConnectionName() {
		return connectionName;
	}

	public String getCubeName() {
		return cubeName;
	}

	public String getCatalog() {
		return catalog;
	}

	public String getSchema() {
		return schema;
	}


}

package org.saiku.olap.discover.pojo;

public class ConnectionPojo {
	
	private String name;
	private String catalog;
	private String schema;

	public ConnectionPojo(String _name, String _catalog, String _schema) {
		name = _name;
		catalog = _catalog;
		schema = _schema;
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

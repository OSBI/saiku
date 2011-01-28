package org.saiku.olap.dto;

public class SaikuCube extends AbstractSaikuObject {

	private String connectionName;
	private String catalogName;
	private String schemaName;
	private Object cubeDescription;

	public SaikuCube() {
		super(null,null);
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	public SaikuCube(String connectionName, String cubeName, String catalog, String schema, String description) {
		super(cubeName,cubeName);
		this.connectionName = connectionName;
		this.catalogName = catalog;
		this.schemaName = schema;
		this.cubeDescription = description;
	}

	@Override
	public String getUniqueName() {
		String uniqueName = "[" + connectionName + "].[" + catalogName + "]";
		uniqueName += ".[" + schemaName + "].[" + getName() + "]";
		return uniqueName;
	}
	
	public String getCatalogName() {
		return catalogName;
	}
	public String getConnectionName() {
		return connectionName;
	}

	public Object getCubeDescription() {
		return cubeDescription;
	}
	public String getSchemaName() {
		return schemaName;
	}
}


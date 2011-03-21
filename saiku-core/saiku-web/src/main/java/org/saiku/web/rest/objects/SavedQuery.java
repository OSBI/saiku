package org.saiku.web.rest.objects;


public class SavedQuery {
	private String name;
	private String lastModified;
	
	public SavedQuery() {		
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}
	
	public SavedQuery(String name, String lastModified) {
		this.name = name;
		this.lastModified = lastModified;
	}
	
	public String getName() {
		return name;
	}
	
	public String getLastModified() {
		return lastModified;
	}
}


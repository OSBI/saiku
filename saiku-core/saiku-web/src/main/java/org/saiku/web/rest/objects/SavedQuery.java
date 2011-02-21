package org.saiku.web.rest.objects;

import java.text.SimpleDateFormat;
import java.util.Date;

public class SavedQuery {
	private String name;
	private String lastModified;
	
	public SavedQuery() {};
	
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


package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;


@XmlAccessorType(XmlAccessType.FIELD)
public class SavedQuery implements Comparable<SavedQuery> {
	private String name;
	private String lastModified;
	private String xml;
	
	public SavedQuery() {		
	}
	
	public SavedQuery(String name, String lastModified, String xml) {
		this.name = name;
		this.lastModified = lastModified;
		this.xml = xml;
	}
	
	public String getName() {
		return name;
	}
	
	public String getLastModified() {
		return lastModified;
	}

	public String getXml() {
		return xml;
	}

	public void setXml(String xml) {
		this.xml = xml;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setLastModified(String lastModified) {
		this.lastModified = lastModified;
	}

	public int compareTo(SavedQuery o) {
		return name.compareTo(o.getName());
	}
}


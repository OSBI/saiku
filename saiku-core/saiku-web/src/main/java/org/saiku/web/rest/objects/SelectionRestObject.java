package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.FIELD)
public class SelectionRestObject {
	
	private String uniquename;
	private String type;

	public SelectionRestObject() {
	}
	
	public String getUniquename() {
		return uniquename;
	}

	public String getType() {
		return type;
	}

	
	
}

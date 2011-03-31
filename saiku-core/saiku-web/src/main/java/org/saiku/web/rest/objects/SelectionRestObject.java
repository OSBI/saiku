package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.FIELD)
public class SelectionRestObject {
	
	private String uniquename;
	private String hierarchy;
	private String type;
	private String action;


	public SelectionRestObject() {
	}
	
	public String getUniquename() {
		return uniquename;
	}

	public String getType() {
		return type;
	}

	public String getHierarchy() {
		return hierarchy;
	}

	public String getAction() {
		return action;
	}

	
	
}

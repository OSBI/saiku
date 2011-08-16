package org.saiku.web.rest.objects;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

@XmlAccessorType(XmlAccessType.FIELD)
public class SelectionListRestObject {
	
	private List<SelectionRestObject> selections;

	public SelectionListRestObject() {
	}

	public SelectionListRestObject(List<SelectionRestObject> selections) {
		this.selections = selections;
	}

	public List<SelectionRestObject> getSelections() {
		return selections;
	}

	public void setSelections(List<SelectionRestObject> selections) {
		this.selections = selections;
	}
	
		
}

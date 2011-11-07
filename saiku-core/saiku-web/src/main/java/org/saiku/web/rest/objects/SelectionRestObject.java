/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
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

	public void setUniquename(String uniquename) {
		this.uniquename = uniquename;
	}

	public void setHierarchy(String hierarchy) {
		this.hierarchy = hierarchy;
	}

	public void setType(String type) {
		this.type = type;
	}

	public void setAction(String action) {
		this.action = action;
	}

	
	
}

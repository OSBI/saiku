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
package org.saiku.olap.dto;

public  class AbstractSaikuObject implements ISaikuObject,Comparable<ISaikuObject>  {

	private String uniqueName;
	private String name;
	
	public AbstractSaikuObject() {	}
	
	public AbstractSaikuObject(String uniqueName, String name) {
		this.uniqueName = uniqueName;
		this.name = name;
	}
	public String getUniqueName() {
		return uniqueName;
	}
	
	public String getName() {
		return name;
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((uniqueName == null) ? 0 : uniqueName.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AbstractSaikuObject other = (AbstractSaikuObject) obj;
		if (uniqueName == null) {
			if (other.uniqueName != null)
				return false;
		} else if (!uniqueName.equals(other.uniqueName))
			return false;
		return true;
	}
	
	@Override
	public String toString() {
		return this.uniqueName;
	}

	public int compareTo(ISaikuObject o) {
		return getUniqueName().compareTo(o.getUniqueName());
	}

}

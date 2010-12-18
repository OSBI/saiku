/*
 * Copyright (C) 2010 Paul Stoellberger
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
package org.saiku.web.rest.objects.resultset;

import java.util.Properties;

import org.saiku.web.rest.objects.AbstractRestObject;

public class Cell extends AbstractRestObject {

	private String value;
	private String type;
	private Properties properties;
	private Properties metaproperties;

	
	public enum Type {
		ROW_HEADER,
		COLUMN_HEADER,
		DATA_CELL,
		EMPTY,
		UNKNOWN
	}
	
	public Cell() {
	}
	
	public Cell(String value) {
		this(value,new Properties(), new Properties(), Type.EMPTY);
	}
	
	public Cell(String value, Properties metaproperties, Properties properties, Type type) {
		this.value = value;
		this.properties = properties;
		this.metaproperties = metaproperties;
		this.type = type.toString();
	}
	
	public String getValue() {
		return value;
	}

	public Properties getProperties() {
		return properties;
	}

	public Properties getMetaproperties() {
		return metaproperties;
	}

	public String getType() {
		return type;
	}

	@Override
	public String getCompareValue() {
		return value;
	}

	@Override
	public Object toNativeObject() {
		return null;
	}

	@Override
	public String toString() {
		return value;
	}

	
	
}

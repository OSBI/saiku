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
package org.saiku.web.rest.objects.resultset;

import java.util.Properties;


public class Cell  {

	private String value;
	private String type;
	private Properties properties = new Properties();
//	private Properties metaproperties;

	
	public enum Type {
		ROW_HEADER,
		ROW_HEADER_HEADER,
		COLUMN_HEADER,
		DATA_CELL,
		EMPTY,
		UNKNOWN,
		ERROR
	}
	
	public Cell() {
	}
	
	public Cell(String value) {
		this(value,Type.EMPTY);
	}
	
	public Cell(String value, Properties properties, Type type) {
		this.value = value;
		this.properties.putAll(properties);
		this.type = type.toString();
	}
	
	public Cell(String value, Type type) {
		this.value = value;
		this.type = type.toString();
	}
	
	public String getValue() {
		return value;
	}

	public Properties getProperties() {
		return properties;
	}
//
//	public Properties getMetaproperties() {
//		return metaproperties;
//	}

	public String getType() {
		return type;
	}

	
	
}

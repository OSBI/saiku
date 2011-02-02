/*
 * Copyright (C) 2011 Paul Stoellberger
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
package org.saiku.service.datasource;

import java.util.HashMap;
import java.util.Map;

import org.olap4j.OlapConnection;
import org.saiku.datasources.SaikuDatasources;
import org.saiku.datasources.connection.ISaikuConnection;

public class DatasourceService {
	
	private SaikuDatasources datasources;
	
	public void setDatasources(SaikuDatasources ds) {
		datasources = ds;
	}
	
	public Map<String,OlapConnection> getOlapDatasources() {
		Map<String, OlapConnection> resultDs = new HashMap<String,OlapConnection>();
		Map<String, ISaikuConnection> storedDs =  datasources.getAllConnections();
		for (ISaikuConnection con: storedDs.values()) {
			if (con.getConnection() instanceof OlapConnection) {
				resultDs.put(con.getName(), (OlapConnection)con.getConnection());
			}
			
		}
		return resultDs;
	}
	
	public OlapConnection getOlapDatasource(String name) {
		Object o = datasources.get(name);
		if (o != null && o instanceof OlapConnection) {
			return (OlapConnection) o;
		}
		return null;
	}

}

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
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.util.exception.SaikuServiceException;

public class DatasourceService {
	
	private IDatasourceManager datasources;
	
	private Map<String,ISaikuConnection> connections = new HashMap<String,ISaikuConnection>();
	
	public void setDatasourceManager(IDatasourceManager ds) {
		datasources = ds;
		init();
	}

	private void init() {
		try {
			for (SaikuDatasource sd : datasources.getDatasources().values()) {
				ISaikuConnection con = SaikuConnectionFactory.getConnection(sd);
				if (con.initialized()) {
					connections.put(con.getName(), con);
				}
			}
		} catch (Throwable e) {
			throw new SaikuServiceException("There was an error during datasource initialization ",e);
		}
	}
	
	public Map<String,OlapConnection> getOlapConnections() {
		Map<String, OlapConnection> resultDs = new HashMap<String,OlapConnection>();
		for (ISaikuConnection con: connections.values()) {
			if (con.getConnection() instanceof OlapConnection) {
				resultDs.put(con.getName(), (OlapConnection)con.getConnection());
			}
			
		}
		return resultDs;
	}
	
	public OlapConnection getOlapConnection(String name) {
		Object o = connections.get(name);
		if (o != null && o instanceof OlapConnection) {
			return (OlapConnection) o;
		}
		return null;
	}
	
	public void reload() {
		datasources.load();
		init();
	}
	
	public void addDatasource(SaikuDatasource datasource) {
		datasources.addDatasource(datasource);
	}
	
	public void setDatasource(SaikuDatasource datasource) {
		datasources.setDatasource(datasource);
	}
	
	public void removeDatasource(String datasourceName) {
		datasources.removeDatasource(datasourceName);
	}
	
	public SaikuDatasource getDatasource(String datasourceName) {
		return datasources.getDatasource(datasourceName);
	}
	
	public Map<String,SaikuDatasource> getDatasources() {
		return datasources.getDatasources();
	}

}

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
package org.saiku.datasources;

import java.util.HashMap;
import java.util.Map;

import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;


public class SaikuDatasources {
	
	private SaikuConnectionFactory connectionFactory;
	
	private static Map<String,ISaikuConnection> connections = new HashMap<String,ISaikuConnection>();
	
	public void setConnectionFactory(SaikuConnectionFactory conService) {
		connectionFactory = conService;
		connectionFactory.connect();
		for (ISaikuConnection con : connectionFactory.getConnections()) {
			connections.put(con.getName(),con);
		}
		
	}
	
	public Object get(String name) {
		if (connections.get(name) != null) {
			return connections.get(name).getConnection();
		}
		return null;
	}
	
	public Map<String,ISaikuConnection> getAllConnections() {
		return connections;
	}
	
	public void reload() {
		connectionFactory.connect();
	}
	

}

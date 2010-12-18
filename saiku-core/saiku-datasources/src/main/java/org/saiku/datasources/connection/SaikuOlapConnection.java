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
package org.saiku.datasources.connection;

import java.io.File;
import java.sql.DriverManager;
import java.util.Properties;

import org.olap4j.OlapConnection;
import org.olap4j.OlapWrapper;

public class SaikuOlapConnection implements ISaikuConnection {

	private String name;
	private boolean initialized = false;
	private Properties properties;
	private OlapConnection olapConnection;

	public void setProperties(Properties props) {
		properties = props;
	}
	
	public boolean connect() {
		return connect(properties);
	}

	public boolean connect(Properties props) {
		String driver = props.getProperty(ISaikuConnection.DRIVER_KEY);
		name = props.getProperty(ISaikuConnection.NAME_KEY);
		String url = props.getProperty(ISaikuConnection.URL_KEY);
		properties = props;

		try {
			Class.forName(driver);
			OlapConnection connection;
			System.out.println("File:" + (new File("test")).getAbsolutePath());
			connection = (OlapConnection) DriverManager.getConnection(url, properties);
			final OlapWrapper wrapper = connection;
			OlapConnection tmpolapConnection = (OlapConnection) wrapper.unwrap(OlapConnection.class);
			System.out.println("name:" + name);
			System.out.println("driver:" + driver);
			System.out.println("url:" + url);
			if (tmpolapConnection == null) {
				throw new Exception("Connection is null");
			}
			olapConnection = tmpolapConnection;
			System.out.println("Catalogs:" + olapConnection.getCatalogs().size());
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		initialized = true;
		return true;
	}

	public String getDatasourceType() {
		return ISaikuConnection.OLAP_DATASOURCE;
	}

	public boolean initialized() {
		return initialized;
	}

	public Object getConnection() {
		return olapConnection;
	}


	public String getName() {
		return name;
	}

}

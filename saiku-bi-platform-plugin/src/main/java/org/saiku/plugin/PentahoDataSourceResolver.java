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
package org.saiku.plugin;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import mondrian.spi.DataSourceResolver;

import org.apache.log4j.Logger;
import org.pentaho.platform.api.data.DatasourceServiceException;
import org.pentaho.platform.api.data.IDatasourceService;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;

/**
 * This class provides SPI functionality to Mondrian.
 * It resolves relational data sources by their name.
 * It uses the {@link PentahoSessionHolder}.
 * @author Luc Boudreau
 */
public class PentahoDataSourceResolver implements DataSourceResolver {
	Logger logger = Logger.getLogger(PentahoDataSourceResolver.class);
	public DataSource lookup(String dataSourceName) throws Exception {
		IDatasourceService datasourceSvc =
			PentahoSystem.getObjectFactory().get(
					IDatasourceService.class,
					PentahoSessionHolder.getSession());
		javax.sql.DataSource datasource;
		try {
			datasource =
				datasourceSvc.getDataSource(
						datasourceSvc.getDSUnboundName(dataSourceName));
		}
		catch (DatasourceServiceException e) {
			Context initContext = new InitialContext();
			if (dataSourceName != null && !dataSourceName.startsWith("java:/comp/env/")) {
				dataSourceName = "java:/comp/env/" + dataSourceName;
			}
			datasource  = (DataSource)initContext.lookup(dataSourceName);
		}
		return datasource;

	}
}

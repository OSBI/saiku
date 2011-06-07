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

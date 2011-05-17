package org.saiku.plugin;

import javax.sql.DataSource;

import org.apache.log4j.Logger;
import org.pentaho.platform.api.data.DatasourceServiceException;
import org.pentaho.platform.api.data.IDatasourceService;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.web.servlet.messages.Messages;

import mondrian.spi.DataSourceResolver;

/**
 * This class provides SPI functionality to Mondrian.
 * It resolves relational data sources by their name.
 * It uses the {@link PentahoSessionHolder}.
 * @author Luc Boudreau
 */
public class PentahoDataSourceResolver implements DataSourceResolver {
  Logger logger = Logger.getLogger(PentahoDataSourceResolver.class);
  public DataSource lookup(String dataSourceName) throws Exception {
    try {
      IDatasourceService datasourceSvc =
        PentahoSystem.getObjectFactory().get(
          IDatasourceService.class,
          PentahoSessionHolder.getSession());
      javax.sql.DataSource datasource =
        datasourceSvc.getDataSource(
          datasourceSvc.getDSUnboundName(dataSourceName));
      return datasource;
    } catch (ObjectFactoryException e) {
      throw e;
    } catch (DatasourceServiceException e) {
      throw e;
    }
  }
}

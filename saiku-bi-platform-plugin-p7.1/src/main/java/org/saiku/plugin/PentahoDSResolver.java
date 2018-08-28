package org.saiku.plugin;

import mondrian.spi.DataSourceResolver;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.data.DBDatasourceServiceException;
import org.pentaho.platform.api.data.IDBDatasourceService;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.web.servlet.messages.Messages;
import javax.sql.DataSource;

/**
 * Created by bugg on 06/04/16.
 */
public class PentahoDSResolver implements DataSourceResolver {
  private static final Log logger = LogFactory.getLog( PentahoDataSourceResolver.class );

  public DataSource lookup( String dataSourceName ) throws Exception {
    javax.sql.DataSource datasource = null;
    String unboundDsName = null;
    IDBDatasourceService datasourceSvc = null;
    try {
      datasourceSvc =
          PentahoSystem.getObjectFactory().get( IDBDatasourceService.class, PentahoSessionHolder.getSession() );
      unboundDsName = datasourceSvc.getDSUnboundName( dataSourceName );
      datasource = datasourceSvc.getDataSource( unboundDsName );
    } catch ( ObjectFactoryException e ) {
      logger.error( Messages.getInstance().getErrorString( "PentahoXmlaServlet.ERROR_0002_UNABLE_TO_INSTANTIATE" ), e ); //$NON-NLS-1$
      throw e;
    } catch ( DBDatasourceServiceException e ) {
      /* We tried to find the datasource using unbound name.
      ** Now as a fall back we will attempt to find this datasource as it is.
      ** For example jboss/datasource/Hibernate. The unbound name ends up to be Hibernate
      ** We will first look for Hibernate and if we fail then look for jboss/datasource/Hibernate */

      logger.warn( Messages.getInstance().getString(
          "PentahoXmlaServlet.WARN_0001_UNABLE_TO_FIND_UNBOUND_NAME", dataSourceName, unboundDsName ), e ); //$NON-NLS-1$
      try {
        datasource = datasourceSvc.getDataSource( dataSourceName );
      } catch ( DBDatasourceServiceException dbse ) {
        logger
            .error( Messages.getInstance().getErrorString( "PentahoXmlaServlet.ERROR_0002_UNABLE_TO_INSTANTIATE" ), e ); //$NON-NLS-1$
        throw dbse;
      }
    }
    return datasource;
  }
}

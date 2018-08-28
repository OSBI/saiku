package org.saiku.plugin.util;

import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceProcessor;

public class PentahoUniqueDatasourceProcessor implements IDatasourceProcessor {

	public SaikuDatasource process(SaikuDatasource ds) {
		String url = ds.getProperties().getProperty("location");
		String sessionName = PentahoSessionHolder.getSession().getName();
		url += ";JdbcConnectionUuid=" + sessionName;
		ds.getProperties().put("location", url);
		return ds;
	}

}

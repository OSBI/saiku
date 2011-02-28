package org.saiku.datasources.connection;

import org.saiku.datasources.datasource.SaikuDatasource;



public class SaikuConnectionFactory {


	public static ISaikuConnection getConnection(SaikuDatasource datasource) {
		switch (datasource.getType()) {
		case OLAP:
			ISaikuConnection con = new SaikuOlapConnection(datasource.getName(),datasource.getProperties());
			if (con.connect()) {
				return con;
			}
			break;
		}
		return null;
	}
}

package org.saiku.plugin;

import java.sql.SQLException;

import mondrian.rolap.RolapConnection;

import org.olap4j.OlapConnection;
import org.saiku.datasources.connection.IConnectionProcessor;
import org.saiku.datasources.connection.ISaikuConnection;

public class CustomRole implements IConnectionProcessor {

	public ISaikuConnection process(ISaikuConnection con) {
		if (con != null 
				&& ISaikuConnection.OLAP_DATASOURCE.equals(con.getDatasourceType())
				&& con.getConnection() instanceof OlapConnection) 
		{
			OlapConnection olapCon = (OlapConnection) con.getConnection();
			try {
				RolapConnection rCon = olapCon.unwrap(RolapConnection.class);
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			//rCon.setRole(myCustomRoleImplementation);
			
		}
		
		return con;
	}

}

package org.saiku.datasources.connection.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.saiku.datasources.connection.AbstractConnectionManager;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.olap.util.exception.SaikuOlapException;

public class SimpleConnectionManager extends AbstractConnectionManager {
    private Map<String, ISaikuConnection> connections = new HashMap<String, ISaikuConnection>();
    private List<String> errorConnections = new ArrayList<String>();

 
    
    @Override
    public void init() throws SaikuOlapException {
    	this.connections = getAllConnections();
    }

    @Override
    protected ISaikuConnection getInternalConnection(String name, SaikuDatasource datasource)
      throws SaikuOlapException {

        ISaikuConnection con = null;
        String newName = name;
        
        if (!connections.containsKey(newName)) {
            con =  connect(name, datasource);
            if (con != null) {
                connections.put(newName, con);
            } else {
                if (!errorConnections.contains(newName)) {
                    errorConnections.add(newName);
                }
            }

        } else {
            con = connections.get(newName);
        }
        return con;
    }

    @Override
    protected ISaikuConnection refreshInternalConnection(String name, SaikuDatasource datasource) {
		try {
			String newName = name;
			ISaikuConnection con = connections.remove(newName);
			if (con != null) {
				con.clearCache();
			}
			con = null;
			return getInternalConnection(name, datasource);
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return null;
    }

    private ISaikuConnection connect(String name, SaikuDatasource datasource) throws SaikuOlapException {
      if ( datasource != null ) {


        try {
          ISaikuConnection con = SaikuConnectionFactory.getConnection( datasource );
          if ( con.initialized() ) {
            return con;
          }
        } catch ( Exception e ) {
          e.printStackTrace();
        }

        return null;
      }

    throw new SaikuOlapException(  "Cannot find connection: (" + name + ")"  );
  }
}

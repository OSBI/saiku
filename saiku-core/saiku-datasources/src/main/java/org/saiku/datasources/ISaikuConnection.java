/**
 * 
 */
package org.saiku.datasources;

import java.util.Properties;

/**
 * @author pmac
 *
 */
public interface ISaikuConnection {
	
    public static final String OLAP_DATASOURCE = "OLAP"; //$NON-NLS-1$
    public static final String NAME_KEY = "name"; //$NON-NLS-1$
    public static final String DRIVER_KEY = "driver"; //$NON-NLS-1$
    public static final String URL_KEY = "location"; //$NON-NLS-1$
    public static final String USERNAME_KEY = "username"; //$NON-NLS-1$
    public static final String PASSWORD_KEY = "password"; //$NON-NLS-1$

    public static final String[] KEYS = new String[] { NAME_KEY, DRIVER_KEY, URL_KEY,
	      USERNAME_KEY, PASSWORD_KEY };

	  /**
	   * Sets the properties to be used when the connection is made. The standard 
	   * keys for the properties are defined in this interface
	   * @param props
	   */
	  void setProperties( Properties props );
	  

	  /**
	   * @return the last resultset from the last query executed
	   *
	  IUnifiedResultSet getResultSet();
	  
	  /**
	   * Connects to the data source using the supplied properties.
	   * @param props Datasource connection properties
	   * @return true if the connection was successful
	   */
	  boolean connect(Properties props);
	  
	  boolean connect();
	  /**
	   * @return true if the connection has been properly initialized.
	   */
	  public boolean initialized();

	  /**
	   * returns the type of connection
	   * @return
	   */
	  public String getDatasourceType();

}

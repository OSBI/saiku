/*
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.helper;

import org.hsqldb.jdbc.jdbcDataSource;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

/**
 * HSQL Foodmart Database Initialiser
 */
public class DatabaseHelper {

  private static final Properties testProps = new Properties();

  private static void dump(ResultSet rs) throws SQLException {

    // the order of the rows in a cursor
    // are implementation dependent unless you use the SQL ORDER statement
    ResultSetMetaData meta = rs.getMetaData();
    int colmax = meta.getColumnCount();
    int i;
    Object o;

    // the result set is a cursor into the data. You can only
    // point to one row at a time
    // assume we are pointing to BEFORE the first row
    // rs.next() points to next row and returns true
    // or false if there is no next row, which breaks the loop
    for (; rs.next(); ) {
      for ( i = 0; i < colmax; ++i ) {
        o = rs.getObject( i + 1 ); // Is SQL the first column is indexed

        // with 1 not 0
        System.out.print( o.toString() + " " );
      }

      System.out.println( " " );
    }
  }

  private String getTestProperty(String key) {
    return testProps.getProperty( key );
  }

  private void slurp( Statement stm, InputStream stream ) throws Exception {
    if ( stream == null ) {
      throw new FileNotFoundException( "Load data: File " + "foodmart_hsql.script"
        + " does not exist" );
    }

    DataInputStream in = new DataInputStream( stream );
    BufferedReader br = new BufferedReader( new InputStreamReader( in ) );

    String strLine;

    while ( ( strLine = br.readLine() ) != null ) {
      // stm.addBatch(strLine);
      stm.execute( strLine );
    }

    in.close();
  }

  public void setup() throws Exception {
    InputStream inputStream = getClass().getResourceAsStream( "../connection.properties" );
    testProps.load( inputStream ); //$NON-NLS-1$

    jdbcDataSource ds = new jdbcDataSource();
    ds.setDatabase( getTestProperty( "name" ) ); //$NON-NLS-1$
    ds.setUser( getTestProperty( "username" ) ); //$NON-NLS-1$
    ds.setPassword( getTestProperty( "password" ) ); //$NON-NLS-1$


    try {
      Class.forName( "org.hsqldb.jdbcDriver" );

      Connection c = DriverManager.getConnection( "jdbc:hsqldb:file:target/test/myunittests", "SA", "" );

      // Create the mondrian schema
      //Connection c = ds.getConnection();
      Statement stm = c.createStatement();

      try {
        ResultSet rs = stm.executeQuery( "SELECT count(*) FROM \"account\"" );

        dump( rs );
        stm.clearBatch();
        stm.close();
        c.commit();
        c.close();
      } catch ( Exception e ) {
        stm.clearBatch();
        stm.close();
        stm = c.createStatement();

        slurp( stm, DatabaseHelper.class
          .getResourceAsStream( "../foodmart_hsql.script" ) ); //$NON-NLS-1$
        stm.executeBatch();
        stm.clearBatch();
        stm.close();
        c.commit();
        c.close();

      }
    } catch ( ClassNotFoundException e ) {
      e.printStackTrace();
    }
  }
}

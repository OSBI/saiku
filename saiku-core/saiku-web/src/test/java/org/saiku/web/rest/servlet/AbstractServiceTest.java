package org.saiku.web.rest.servlet;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.Statement;
import java.util.Properties;

import javax.sql.DataSource;

import org.hsqldb.jdbc.jdbcDataSource;
import javax.naming.Context;
import javax.naming.InitialContext;


public abstract class AbstractServiceTest {

	private static boolean IS_INIT_DONE = false;
    
    private static DataSource applicationDatasource = null;

    private static Properties testProps = new Properties();


    protected static void initTestContext() {
        if (!IS_INIT_DONE) {
            try {

                /*
                 * Step 1. Create a datasource for Mondrian tests.
                 */
                // Load test context properties.
                testProps.loadFromXML(AbstractServiceTest.class
                        .getResourceAsStream("test.properties.xml")); //$NON-NLS-1$

                // Create the mondrian datasource
                jdbcDataSource ds = new jdbcDataSource();
                ds.setDatabase(getTestProperty("context.database")); //$NON-NLS-1$
                ds.setUser(getTestProperty("context.username")); //$NON-NLS-1$
                ds.setPassword(getTestProperty("context.password")); //$NON-NLS-1$
                
                // Bind the datasource in the directory
                Context ctx = new InitialContext();
                ctx.bind(getTestProperty("context.jndi"), ds); //$NON-NLS-1$
                
                // Create the application datasource
                jdbcDataSource ds2 = new jdbcDataSource();
                ds2.setDatabase(getTestProperty("pat.database")); //$NON-NLS-1$
                ds2.setUser(getTestProperty("pat.username")); //$NON-NLS-1$
                ds2.setPassword(getTestProperty("pat.password")); //$NON-NLS-1$
                
                // Bind the datasource in the directory
                ctx.bind(getTestProperty("pat.jndi"), ds2); //$NON-NLS-1$

                // Create the mondrian schema
                Connection c = ds.getConnection();
                Statement stm = c.createStatement();
                slurp(stm, AbstractServiceTest.class
                        .getResourceAsStream("sampledata.sql")); //$NON-NLS-1$
                stm.executeBatch();
                stm.clearBatch();
                stm.close();
                c.commit();
                c.close();
                
                IS_INIT_DONE = true;
                
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
            //initDatabase();
    }

    protected static String getTestProperty(String key) {
        return testProps.getProperty(key);
    }
    
    private static void slurp(Statement stm, InputStream stream) throws Exception {
        DataInputStream in = new DataInputStream(stream);
        BufferedReader br = new BufferedReader(new InputStreamReader(in));

        String strLine;

        while ((strLine = br.readLine()) != null) {
            // stm.addBatch(strLine);
            stm.execute(strLine);
        }

        in.close();
    }

    protected static void initDatabase()
    {
        try {
        /*
         * Step 1. Clear data.
         */
            Connection c = applicationDatasource.getConnection();
            Statement stm = c.createStatement();
            slurp(stm, AbstractServiceTest.class.getResourceAsStream("pat-delete.sql")); //$NON-NLS-1$
            stm.executeBatch();
            stm.clearBatch();
            stm.close();
            c.commit();
            c.close();
            
//            ((SessionFactory)applicationContext.getBean("sessionFactory")).isClosed()
            /*
             * Step 2. Insert data
             */
            c = applicationDatasource.getConnection();
            stm = c.createStatement();
            slurp(stm, AbstractServiceTest.class.getResourceAsStream("pat-insert.sql")); //$NON-NLS-1$
            stm.executeBatch();
            stm.clearBatch();
            stm.close();
            c.commit();
            c.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    
}

package org.saiku.rest.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.junit.Test;

import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuOlapConnection;
import org.saiku.rest.DataSourceInterface;
import org.saiku.rest.DataSources;

import static org.mockito.Mockito.*;
import com.sun.jersey.test.framework.JerseyTest;

public class DataSourceInterfaceImplTest extends JerseyTest{

    DataSourceInterface dsi;
    
    public DataSourceInterfaceImplTest() throws Exception {
        super("org.saiku.rest");
    }
    
    @Test
    public void testGetAvailableDataSources(){
        List conns = new ArrayList();
        ISaikuConnection isc = mock(SaikuOlapConnection.class);
        Properties props = new Properties();
        props.setProperty("OLAP", "OLAP");
        props.setProperty("name", "testconnection");
        props.setProperty("driver", "com.saiku.testDriver");
        props.setProperty("location", "mars");
        props.setProperty("username", "testuser");
        props.setProperty("password", "testpassword");
        
        isc.setProperties(props);
        
        when(isc.connect()).thenReturn(true);
        
        conns.add(isc);
        
        SaikuConnectionFactory scf = mock(SaikuConnectionFactory.class);
        
        DataSources ds = mock(DataSources.class);
        
        //Create sample datasource.
        ds.createDataSource(connectionName, schemaname, cubes);
        
        
       DataSources datasources = dsi.getDataSources();
    }
    
    @Test
    public void testConvertDataSourcesToJson(){
        
    }
    @Test
    public void testOpenDataSource(){
       
    }
    
    @Test
    public void testFailedOpenDataSource(){
        
    }
    
    private void initTest() {
        
    }
    
    
    private void finishTest() {
        
    }
}

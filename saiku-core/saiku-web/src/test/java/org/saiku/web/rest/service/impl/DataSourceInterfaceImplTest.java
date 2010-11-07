package org.saiku.web.rest.service.impl;

import com.sun.jersey.api.client.filter.LoggingFilter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.junit.Test;

import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.SaikuConnectionFactory;
import org.saiku.datasources.connection.SaikuOlapConnection;
import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.web.rest.objects.CubeRestPojo;
//import org.saiku.rest.DataSources;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.test.framework.JerseyTest;

public class DataSourceInterfaceImplTest extends JerseyTest{

 //   DataSourceInterface dsi;
    private WebResource r1;
    public DataSourceInterfaceImplTest() throws Exception {
        super("org.saiku.web.rest");
        ClientConfig cc = new DefaultClientConfig();
        // use the following jaxb context resolver
        //cc.getClasses().add(JAXBContextResolver.class);
        Client c = Client.create(cc);
        
        r1 = c.resource(getBaseURI());
        r1.addFilter(new LoggingFilter());
    }
    @Test
    public void testHelloWorld() {
        WebResource webResource = resource();
        String responseMsg = webResource.path("helloworld").get(String.class);
        assertEquals("Hello World", responseMsg);
    }

   /*@Test
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
        
     //   DataSources ds = mock(DataSources.class);
        
        //Create sample datasource.
      //  ds.createDataSource(connectionName, schemaname, cubes);
        
        
   //    DataSources datasources = dsi.getDataSources();
    }*/
    
    @Test
    public void testConvertDataSourcesToJson(){
        CubeRestPojo cubeList = new CubeRestPojo();
        CubePojo cubePojo = new CubePojo("connectionname", "cubename", "catalogname", "schemaname");
            cubeList.addCubeRestPojo(cubePojo);
        
            WebResource webResource = resource();
            String responseMsg = webResource.path("json").path("saiku").path("session").get(String.class);
            assertEquals("Hello World", responseMsg);
        
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

package org.saiku.web.rest.service.impl;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.test.framework.AppDescriptor;
import com.sun.jersey.test.framework.JerseyTest;
import com.sun.jersey.test.framework.WebAppDescriptor;

public class DataSourceInterfaceImplTest extends JerseyTest{

 //   DataSourceInterface dsi;
    private WebResource r1;
    protected AppDescriptor configure() {
        ClientConfig cc = new DefaultClientConfig();
        // use the following jaxb context resolver
        //cc.getClasses().add(JAXBContextResolver.class);
        return new WebAppDescriptor.Builder("org.saiku.web.rest.service")
                .contextPath("/")
                .clientConfig(cc)
                .build();
    }
   /* @Test
    public void testHelloWorld() {
        WebResource webResource = resource();
        String responseMsg = webResource.path("helloworld").get(String.class);
        assertEquals("Hello World", responseMsg);
    }*/

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
    public void testApplicationWadl() {
        WebResource webResouce = resource();
        String applicationWadl = webResouce.path("application.wadl").get(String.class);
        System.out.println(applicationWadl);
        assertTrue("Something wrong. Returned wadl length is not > 0",
                applicationWadl.length() > 0);
    }
    @Test
    public void testConvertDataSourcesToJson(){
     
        
            WebResource webResource = resource();
            String responseMsg = webResource.path("saiku").path("session").get(String.class);
            assertEquals("HELLO", responseMsg);
        
    }
 /*   @Test
    public void testOpenDataSource(){
       
    }
    
    @Test
    public void testFailedOpenDataSource(){
        
    }
   */ 
    private void initTest() {
        
    }
    
    
    private void finishTest() {
        
    }
}

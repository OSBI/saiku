package org.saiku.web.rest.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.test.framework.AppDescriptor;
import com.sun.jersey.test.framework.JerseyTest;
import com.sun.jersey.test.framework.WebAppDescriptor;

@ContextConfiguration(locations={"saiku-beans.xml"})
@RunWith(SpringJUnit4ClassRunner.class)
public class DataSourceInterfaceImplTest extends JerseyTest {

    
    
    protected OlapDiscoverService olapDiscoverService = null;
    
    protected static ApplicationContext applicationContext = null;
    protected AppDescriptor configure() {
    	initTest();
    	
    	ClientConfig cc = new DefaultClientConfig();
        // use the following jaxb context resolver
        //cc.getClasses().add(JAXBContextResolver.class);
        return new WebAppDescriptor.Builder("org.saiku.web.rest.service")
                .contextPath("/")
                .contextParam("","")
                .clientConfig(cc)
                .build();
        
        
}
    private final String[] contextFiles = new String[] { 
            "/saiku-beans.xml" //$NON-NLS-1$
        };
    
    private void initTest() {
        try{
        applicationContext = new FileSystemXmlApplicationContext(
                contextFiles);
      System.out.println("applicationContext: "+ applicationContext);   
 //   olapDiscoverService = (OlapDiscoverService)applicationContext.getBean("olapDiscoverServiceBean");
        
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}


    @Autowired
	public void setOlapDiscoverService(OlapDiscoverService olapds) {
         olapDiscoverService = olapds;
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
    
    @Test
    public void testGetJsonSucceeds()
    {
        WebResource webResource = resource();
        String responseMsg = webResource.path("saiku").path("admin").path("datasources").get(String.class);
        CubesListRestPojo users = webResource.path("saiku").path("admin").path("datasources").accept("application/json").get(CubesListRestPojo.class);
        assertTrue(users != null);
        //assertTrue(users.length() == 1);

    }

    
	@Test
    public void testGetHtmlSucceeds()
    {
   /* ClientResponse response = callGet( path, MediaType.TEXT_HTML_TYPE );
    validateResponse( 200, MediaType.TEXT_HTML_TYPE, response );
    assertTrue( response.getEntity( String.class ).contains( "<td>Name</td><td>FE_Demo</td>" ) );*/
    }

    @Test
    public void testGetDefaultsToJson()
    {
   /* ClientResponse response = callGet( path, MediaType.WILDCARD_TYPE );
    validateResponse( 200, MediaType.APPLICATION_JSON_TYPE, response );*/
    }

    @Test
    public void testPutFails()
    {
    /*ClientResponse response = callPut( path, validJson, MediaType.APPLICATION_JSON_TYPE );
    assertEquals( 405, response.getStatus() );*/
    }


 /*   @Test
    public void testOpenDataSource(){
       
    }
    
    @Test
    public void testFailedOpenDataSource(){
        
    }
   */ 

}

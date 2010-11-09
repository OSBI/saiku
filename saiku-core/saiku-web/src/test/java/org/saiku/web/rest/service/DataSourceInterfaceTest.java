package org.saiku.web.rest.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.saiku.olap.discover.pojo.CubesListRestPojo;

import com.sun.jersey.api.client.WebResource;


public class DataSourceInterfaceTest extends AbstractServiceTest {

  

	@Test
    public void testGetJsonSucceeds()
    {
        WebResource webResource = resource();
        CubesListRestPojo users = webResource.path("saiku").path("admin").path("datasources").accept("application/json").get(CubesListRestPojo.class);
        assertTrue(users != null);
        //assertTrue(users.length() == 1);

    }
    
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



}

package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.web.rest.objects.CubesListRestPojo;
import org.saiku.web.rest.objects.CubesListRestPojo.CubeRestPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletConfig;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

//@RunWith(MockitoJUnitRunner.class)
public class DataSourceInterfaceTest extends AbstractServiceTest {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    @Autowired
    protected OlapDiscoverService olapDiscoverService = null;


//    @Mock
//    private TimberlineEmployeeService mockTimberlineEmployeeService;
//    
//    @InjectMocks
//    private EmployeeCreatedEventHandler handler = new EmployeeCreatedEventHandler();

   

	@Test
    public void testCheckDefaultConnection()
    {
	    DataSourceServlet dsi = new DataSourceServlet();
        dsi.setOlapDiscoverService(olapDiscoverService);
        CubesListRestPojo cubes = dsi.getCubes();
        CubeRestPojo cube = cubes.getCubeList().get(0);
        assertEquals(cube.getCatalog(), "SampleData");
        assertEquals(cube.getConnectionName(), "TestConnection1");
        assertEquals(cube.getCubeName(),"Quadrant Analysis");
        assertEquals(cube.getSchema(), "SampleData");
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
     
        /*
            WebResource webResource = resource();
            String responseMsg = webResource.path("saiku").path("session").get(String.class);
            assertEquals("HELLO", responseMsg);*/
        
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

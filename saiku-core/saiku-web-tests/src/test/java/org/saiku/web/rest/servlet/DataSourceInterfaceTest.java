package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.saiku.service.olap.OlapDiscoverService;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;


//@RunWith(MockitoJUnitRunner.class)
public class DataSourceInterfaceTest extends AbstractServiceTest {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;
   // @Autowired
    protected OlapDiscoverService olapDiscoverService = null;


//    @Mock
//    private TimberlineEmployeeService mockTimberlineEmployeeService;
//    
//    @InjectMocks
//    private EmployeeCreatedEventHandler handler = new EmployeeCreatedEventHandler();

   

	@Test
    public void testCheckDefaultConnection()
    {
	/*    DataSourceServlet dsi = new DataSourceServlet();
        dsi.setOlapDiscoverService(olapDiscoverService);
        List<CubeRestPojo> cubes = dsi.getCubes();
        assertEquals(cubes.size(),2);
        Collections.sort(cubes);
        CubeRestPojo cube = cubes.get(0);
        System.out.println(cube);
        assertEquals(cube.getCatalog(), "SampleData");
        assertEquals(cube.getConnectionName(), "TestConnection1");
        assertEquals(cube.getSchema(),"Quadrant Analysis");
        assertEquals(cube.getCubeName(), "SampleData");

        cube = cubes.get(1);
        System.out.println(cube);
        assertEquals(cube.getCatalog(), "SteelWheels");
        assertEquals(cube.getConnectionName(), "TestConnection1");
        assertEquals(cube.getCubeName(),"SteelWheels");
        assertEquals(cube.getSchema(), "SteelWheelsSales");
*/
    }
    
    @Test
    public void testApplicationWadl() {

    	Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");

        String applicationWadl = webResource.path("application.wadl").get(String.class);
        System.out.println(applicationWadl);
        assertTrue("Something wrong. Returned wadl length is not > 0",
                applicationWadl.length() > 0);
    }
    @Test
    public void testConvertDataSourcesToJson(){
    	Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");
        String applicationWadl = webResource.path("/rest/saiku/bugg/datasources").get(String.class);
        System.out.println(applicationWadl);
        assertTrue("Something wrong. Returned wadl length is not > 0",
                applicationWadl.length() > 0);
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

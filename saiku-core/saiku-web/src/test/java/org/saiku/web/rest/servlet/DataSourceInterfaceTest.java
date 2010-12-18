/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Test;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.beans.factory.annotation.Autowired;

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
        List<SaikuConnection> connections = dsi.getConnections();
        assertEquals(connections.size(),1);
        SaikuConnection con = connections.get(0);
        System.out.println(con);
        assertEquals(con.getConnectionName(), "TestConnection1");
        assertEquals(con.getCatalogs().size(), 2);
        
//        List<CubeRestPojo> cubes = dsi.getCubes();
//        assertEquals(cubes.size(),2);
//        Collections.sort(cubes);
//        CubeRestPojo cube = cubes.get(0);
//        System.out.println(cube);
//        assertEquals(cube.getCatalog(), "SampleData");
//        assertEquals(cube.getConnectionName(), "TestConnection1");
//        assertEquals(cube.getSchema(),"Quadrant Analysis");
//        assertEquals(cube.getCubeName(), "SampleData");
//
//        cube = cubes.get(1);
//        System.out.println(cube);
//        assertEquals(cube.getCatalog(), "SteelWheels");
//        assertEquals(cube.getConnectionName(), "TestConnection1");
//        assertEquals(cube.getCubeName(),"SteelWheels");
//        assertEquals(cube.getSchema(), "SteelWheelsSales");

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

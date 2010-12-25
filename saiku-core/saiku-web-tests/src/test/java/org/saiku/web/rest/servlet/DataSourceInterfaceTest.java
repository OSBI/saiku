package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.saiku.service.olap.OlapDiscoverService;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

public class DataSourceInterfaceTest extends AbstractServiceTest {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    
    protected OlapDiscoverService olapDiscoverService = null;
   

	@Test
    public void testCheckDefaultConnection()
    {
	
    }
    
    @Test
    public void testApplicationWadl() {
/*
    	Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");

        String applicationWadl = webResource.path("application.wadl").get(String.class);
        System.out.println(applicationWadl);
        assertTrue("Something wrong. Returned wadl length is not > 0",
                applicationWadl.length() > 0);*/
    }
    
    @Test
    public void testConvertDataSourcesToJson(){
    	Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");
        String applicationWadl = webResource.path("/rest/saiku/bugg/datasources").accept("application/json").get(String.class);
        System.out.println(applicationWadl);
        assertEquals("[{\"connection\":\"TestConnection1\",\"cube\":\"Quadrant Analysis\",\"catalog\":\"SampleData\",\"schema\":\"SampleData\"},{\"connection\":\"TestConnection1\",\"cube\":\"SteelWheelsSales\",\"catalog\":\"SteelWheels\",\"schema\":\"SteelWheels\"}]", applicationWadl);
        
    }
    

    @Test
    public void testConvertDataSourcesToXML(){
    	Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");
        String applicationWadl = webResource.path("/rest/saiku/bugg/datasources").accept("application/xml").get(String.class);
        System.out.println(applicationWadl);
        assertEquals("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><items><datasource connection=\"TestConnection1\" cube=\"Quadrant Analysis\" catalog=\"SampleData\" schema=\"SampleData\"/><datasource connection=\"TestConnection1\" cube=\"SteelWheelsSales\" catalog=\"SteelWheels\" schema=\"SteelWheels\"/></items>", applicationWadl);
        
    }


    

}

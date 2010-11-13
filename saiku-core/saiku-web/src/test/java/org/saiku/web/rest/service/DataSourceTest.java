/**
 * 
 */
package org.saiku.web.rest.service;

import static org.junit.Assert.*;

import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.web.rest.objects.CubesListRestPojo.CubeRestPojo;
import org.saiku.web.rest.servlet.DataSourceServlet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author tombarber
 *
 */
@ContextConfiguration(locations = { "saiku-beans.xml" })
@RunWith(SpringJUnit4ClassRunner.class)
public class DataSourceTest {

    @Autowired
    protected OlapDiscoverService olapDiscoverService = null;
    
    /**
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
    }

    /**
     * @throws java.lang.Exception
     */
    @After
    public void tearDown() throws Exception {
    }

    /**
     * Test method for {@link org.saiku.web.rest.service.DataSourceInterface#getCubes()}.
     */
    @Test
    public void testGetCubes() {
        DataSourceServlet dsi = new DataSourceServlet();
        dsi.setOlapDiscoverService(olapDiscoverService);
        List<CubeRestPojo> cubes = dsi.getCubes().getCubeList();
        
        assertNotNull(cubes);
        
        assertEquals("SampleData",cubes.get(0).getCubeName());
        
        assertEquals("Quadrant Analysis", cubes.get(0).getSchema());
        
        assertEquals("SampleData", cubes.get(0).getCatalog());
        
        assertEquals("TestConnection1", cubes.get(0).getConnectionName());
        
        
    }

}

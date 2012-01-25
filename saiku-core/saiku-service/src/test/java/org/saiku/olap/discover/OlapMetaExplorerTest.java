package org.saiku.olap.discover;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;

import org.junit.BeforeClass;
import org.junit.Test;
import org.saiku.AbstractServiceUtils;
import org.saiku.TConnectionManager;
import org.saiku.datasources.connection.IConnectionManager;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.ClassPathResourceDatasourceManager;
import org.saiku.service.datasource.IDatasourceManager;


public class OlapMetaExplorerTest {

    private static OlapMetaExplorer olapMetaExplorer;
    private static Properties testProps = new Properties();
    
    /**
     * Test that you can fetch all available connections.
     * @throws SaikuOlapException
     */
    @Test
    public final void testGetAllConnections() throws SaikuOlapException  {
       List<SaikuConnection> output = olapMetaExplorer.getAllConnections();

       assertNotNull(output);
       
       assertEquals(1, output.size());
       assertEquals("test", output.get(0).getName());
       
    }
    
    /**
     * Test that you can get a single connection.
     * @throws SaikuOlapException
     */
    @Test
    public final void testGetConnectionSuccess() throws SaikuOlapException{
        SaikuConnection output = olapMetaExplorer.getConnection("test");
        
        assertNotNull(output);
        
        assertEquals("test", output.getName());
    }
    
    /**
     * Test what happens when you call an non existant connection.
     * @throws SaikuOlapException
     */
    @Test
    public final void testGetConnectionFailure() throws SaikuOlapException{
        /*
         * Connection Failure shouldn't throw an NPE it should throw a nicer error.
         */
        SaikuConnection output = null;
        try{
            output = olapMetaExplorer.getConnection("noname");
        }
        catch (Exception e){
        }
        assertNull(output);

    }
    
    /**
     * Test to prove that non existant connection currently throws NPE.
     * @throws Exception
     */
    @Test(expected = NullPointerException.class)
    public void testForExpectedExceptionWithAnnotation()
            throws Exception {
        olapMetaExplorer.getConnection("noname");
    }
    
    
    public final void testGetMultipleConnections(){
        
    }
    /**
     * Make sure you can grab a cube from a specified connection.
     */
    @Test
    public final void testGetCubesSingleConnection(){
        List<SaikuCube> output = olapMetaExplorer.getCubes("test");

        assertNotNull(output);

        assertEquals("HR", output.get(0).getName());
    }
    
    public final void testGetCubesMultipleConnectionsConnection(){
    }
    
    /**
     * Test to make sure you can retrieve all the cubes from a schema.
     */
    @Test
    public final void testGetAllCubes(){
        List<SaikuCube> output = olapMetaExplorer.getAllCubes();
        
        assertNotNull(output);
        
        assertEquals(8, output.size());
        
        for (int i = 0; i < output.size(); i++){
        	assertEquals("FoodMart", output.get(i).getCatalogName());
        	output.get(i).getName();
        	assertEquals("test", output.get(i).getConnectionName());
        	output.get(i).getCubeName();
        	assertEquals("FoodMart", output.get(i).getSchemaName());
        	output.get(i).getUniqueName();
        }
        
    }
    
    /**
     * Test to make sure that the cubes are returned in the same order.
     */
    @Test
    public final void testCubeReturnOrder(){
    	 List<SaikuCube> output = olapMetaExplorer.getAllCubes();
    	 
         assertNotNull(output);

         String[] names = { "HR","Sales 2","Sales Ragged","Sales Scenario","Sales","Store","Warehouse and Sales","Warehouse"};

         for (int i = 0; i < output.size(); i++){
         	assertEquals(names[i], output.get(i).getName());
         	assertEquals("["+names[i]+"]",output.get(i).getCubeName());
         }
    }
    public final void testGetNativeCube(){
        
        
    }
    
    /**
     * Test to make sure you can get all the dimensions in a cube.
     * @throws SaikuOlapException
     */
    @Test
    public final void testGetAllDimensions() throws SaikuOlapException{
    	List<SaikuCube> cubes = olapMetaExplorer.getAllCubes();
    	
    	
        List<SaikuDimension> dims = olapMetaExplorer.getAllDimensions(cubes.get(0));
        
        assertNotNull(dims);
        assertEquals(7, dims.size());
    }
    
    /**
     * Test to make sure you can get a single dimension in a cube.
     * @throws SaikuOlapException
     */
    @Test
    public final void testGetDimension() throws SaikuOlapException{
        List<SaikuCube> cubes = olapMetaExplorer.getAllCubes();
    	
    	SaikuDimension dim = olapMetaExplorer.getDimension(cubes.get(0), "Department");
    	
    	assertNotNull(dim);
    	
    	assertEquals("Department", dim.getName());
    }
    
    public final void testGetAllHierarchies(){
        
    }
    
    public final void testGetHierarchyRootMembers(){
        
    }
    
    public final void testGetAllLevels(){
        
        
    }
    
    public final void testGetAllMembers(){
        
    }
    
    
    public final void testGetMemeberChildren(){
        
    }
    
    public final void testGetAllMeasures(){
        
    }
    
    public final void testGetMemeber(){
        
    }
    
    
    @BeforeClass
public static void setup(){
    AbstractServiceUtils ast = new AbstractServiceUtils();
    ast.initTestContext();
    IConnectionManager ic = new TConnectionManager();
    IDatasourceManager ds = new ClassPathResourceDatasourceManager("/tmp/files");
    InputStream inputStream= OlapMetaExplorerTest.class.getResourceAsStream("connection.properties");
    try {
        testProps.load(inputStream);
    } catch (IOException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
    }
    ds.setDatasource(new SaikuDatasource("test", SaikuDatasource.Type.OLAP, testProps));
    ic.setDataSourceManager(ds);
    olapMetaExplorer = new OlapMetaExplorer(ic);

}
}

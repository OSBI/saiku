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
    
    @Test
    public final void testGetCubesSingleConnection(){
        List<SaikuCube> output = olapMetaExplorer.getCubes("test");
        
        assertEquals("HR", output.get(0).getName());
    }
    
    public final void testGetCubesMultipleConnectionsConnection(){
    }
    
    public final void testGetAllCubes(){
        
        
    }
    
    public final void testGetNativeCube(){
        
        
    }
    
    public final void testGetAllDimensions(){
        
    }
    
    public final void testGetDimension(){
        
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

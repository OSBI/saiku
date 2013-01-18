package org.saiku.olap.discover;

import junit.framework.TestCase;

import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Assert;
import org.saiku.TestSaikuContext;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.olap.ThinQueryService;


public class ThinQueryServiceTest extends TestCase {

	
	private TestSaikuContext context;
    private OlapMetaExplorer olapMetaExplorer;
    private DatasourceService ds;
    private ThinQueryService tqs;
    
    
    @Override
    protected void setUp() throws Exception {
    	super.setUp();
    	context = TestSaikuContext.instance();
    	olapMetaExplorer = context.olapMetaExplorer;
    	ds = context.datasourceService;
    	tqs = context.thinQueryService;
    }
    
    
    public void testNewQuery() {
    	try {
    	SaikuCube c = TestSaikuContext.getSalesCube();
    	ThinQuery tq = tqs.createEmpty("dummy", c);
    	ObjectMapper om = new ObjectMapper();
    	om.writeValue(System.out, tq);
    	} catch (Exception e) {
    		e.printStackTrace();
    		Assert.fail();
    	}
    	
    }
    
}

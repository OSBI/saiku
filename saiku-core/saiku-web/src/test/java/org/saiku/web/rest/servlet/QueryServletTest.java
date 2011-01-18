/**
 * 
 */
package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import java.util.List;

import javax.servlet.ServletException;
import javax.ws.rs.core.Response.Status;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.QueryRestPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author bugg
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "saiku-beans.xml" })
public class QueryServletTest {

	   @Autowired
	   private QueryServlet qs;

	   @Autowired
	   private OlapQueryService olapQueryService;

	   @Autowired
	
	   OlapDiscoverService olapDiscoverService;

	   
	/**
	 * @throws java.lang.Exception
	 */
	@Before
	public void onetimesetUp() throws Exception {
		qs = new QueryServlet();
		qs.setOlapDiscoverService(olapDiscoverService);
		qs.setOlapQueryService(olapQueryService);
		
	}

	/**
	 * @throws java.lang.Exception
	 */
	@After
	public void onetimetearDown() throws Exception {
	}

	//@Before
	public void setUp() throws Exception {
		
	}

	/**
	 * @throws java.lang.Exception
	 */
	//@After
	public void tearDown() throws Exception {
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#createQuery(String, String, String, String, String)}.
	 */
	@Test
	public final void testCreateQuery() {
		
		//Create new query
		QueryRestPojo testQuery = null;
		try {
			testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery1");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//Check it is not null, has the same name and has an unused axis.
		assertNotNull(testQuery);
		assertEquals("TestQuery1", testQuery.getName());
		assertEquals("UNUSED", testQuery.getAxes().get(0).getAxisName());
		
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getQueries()}.
	 */
	@Test
	public final void testGetQueries() {
		try {
			qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery1");
			qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery2");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		List<QueryRestPojo> queryList = qs.getQueries();
		assertNotNull(queryList);
		assertEquals(queryList.size(), 2);
		assertEquals("TestQuery1", queryList.get(0).getName());
		assertEquals("TestQuery2", queryList.get(1).getName());		
		
		
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteQuery(String)}.
	 */
	@Test
	public final void testDeleteQuery() {
		
		//Create 2 Queries
		try {
			qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery1");
			qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery2");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//Check that the list contains 2 queries
		List<QueryRestPojo> queryList = qs.getQueries();
		assertNotNull(queryList);
		assertEquals(queryList.size(), 2);
		
		//Delete a query
		qs.deleteQuery("TestQuery1");
		
		//Make sure the query has been removed from the list.
		assertEquals("TestQuery2", qs.getQueries().get(0).getName());
	}

	
	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#moveDimension(String, String, String, int)}.
	 */
	@Test
	public final void testMoveDimension() {
		
		//Create a query.
		QueryRestPojo testQuery = null;
		try {
			testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery1");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//Check the query isn't null.
		assertNotNull(testQuery);
		
		//Move a dimension
		Status returnedStatus = qs.moveDimension("TestQuery1", "ROWS", "Store", -1);
	
		//Make sure an OK status was returned.
		assertEquals(Status.OK, returnedStatus);

		//Get the dimension
		List<HierarchyRestPojo> output = qs.getDimensionInfo("TestQuery1", "ROWS", "Store");
		
		//Make sure it has the correct name.
		assertEquals("Store", output.get(0).getName());
	}

	
	
	
	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getMDXQuery(String)}.
	 */
	@Test
	@Ignore
	public final void testGetMDXQuery() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#execute(String)}.
	 */
	@Test
	@Ignore
	public final void testExecute() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getAxisInfo(String, String)}.
	 */
	@Test
	@Ignore
	public final void testGetAxisInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteAxis(String, String)}.
	 */
	@Test
	@Ignore
	public final void testDeleteAxis() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setNonEmpty(String, String, Boolean)}.
	 */
	@Test
	@Ignore
	public final void testSetNonEmpty() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setSort(String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testSetSort() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getDimensionInfo(String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testGetDimensionInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#pullUpDimension(String, String, String, int)}.
	 */
	@Test
	@Ignore
	public final void testPullUpDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#pushDownDimension(String, String, String, int)}.
	 */
	@Test
	@Ignore
	public final void testPushDownDimension() {
		fail("Not yet implemented"); // TODO
	}


	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteDimension(String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testDeleteDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getHierarchyInfo(String, String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testGetHierarchyInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getLevelInfo(String, String, String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testGetLevelInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#includeMember(String, String, String, String, String, int, int)}.
	 */
	@Test
	@Ignore
	public final void testIncludeMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#removeMember(String, String, String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testRemoveMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#includeLevel(String, String, String, String, String, int)}.
	 */
	@Test
	@Ignore
	public final void testIncludeLevel() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#removeLevel(String, String, String, String, String)}.
	 */
	@Test
	@Ignore
	public final void testRemoveLevel() {
		fail("Not yet implemented"); // TODO
	}

}

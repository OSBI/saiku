/**
 * 
 */
package org.saiku.web.rest.servlet;

import static org.junit.Assert.*;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

import java.util.List;

import javax.servlet.ServletException;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
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
		QueryRestPojo testQuery = null;
		try {
			testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart", "TestQuery1");
		} catch (ServletException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		assertEquals("TestQuery1", testQuery.getName());
		assertEquals("UNUSED", testQuery.getAxes().get(0).getAxisName());
		
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getQueries()}.
	 */
	@Test
	public final void testGetQueries() {
		List<QueryRestPojo> queries = qs.getQueries();
		assertFalse(queries.isEmpty());
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteQuery(String)}.
	 */
	@Test
	@Ignore
	public final void testDeleteQuery() {
		fail("Not yet implemented"); // TODO
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
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#moveDimension(String, String, String, int)}.
	 */
	@Test
	@Ignore
	public final void testMoveDimension() {
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

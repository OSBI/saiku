/**
 * 
 */
package org.saiku.web.rest.servlet;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

import java.util.List;

import org.junit.After;
import org.junit.Before;
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
public class QueryServletTest extends AbstractServiceTest{

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
	public void setUp() throws Exception {
		qs = new QueryServlet();
		qs.setOlapDiscoverService(olapDiscoverService);
		qs.setOlapQueryService(olapQueryService);
		
	}

	/**
	 * @throws java.lang.Exception
	 */
	@After
	public void tearDown() throws Exception {
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setOlapQueryService(OlapQueryService)}.
	 */
	@Test
	public final void testSetOlapQueryService() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setOlapDiscoverService(OlapQueryService)}.
	 */
	@Test
	public final void testSetOlapDiscoverServiceOlapQueryService() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setOlapDiscoverService(OlapDiscoverService)}.
	 */
	@Test
	public final void testSetOlapDiscoverServiceOlapDiscoverService() {
		fail("Not yet implemented"); // TODO
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
	public final void testDeleteQuery() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#createQuery(String, String, String, String, String)}.
	 */
	@Test
	public final void testCreateQuery() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getMDXQuery(String)}.
	 */
	@Test
	public final void testGetMDXQuery() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#execute(String)}.
	 */
	@Test
	public final void testExecute() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getAxisInfo(String, String)}.
	 */
	@Test
	public final void testGetAxisInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteAxis(String, String)}.
	 */
	@Test
	public final void testDeleteAxis() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setNonEmpty(String, String, Boolean)}.
	 */
	@Test
	public final void testSetNonEmpty() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#setSort(String, String, String)}.
	 */
	@Test
	public final void testSetSort() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getDimensionInfo(String, String, String)}.
	 */
	@Test
	public final void testGetDimensionInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#pullUpDimension(String, String, String, int)}.
	 */
	@Test
	public final void testPullUpDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#pushDownDimension(String, String, String, int)}.
	 */
	@Test
	public final void testPushDownDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#moveDimension(String, String, String, int)}.
	 */
	@Test
	public final void testMoveDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#deleteDimension(String, String, String)}.
	 */
	@Test
	public final void testDeleteDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getHierarchyInfo(String, String, String, String)}.
	 */
	@Test
	public final void testGetHierarchyInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#getLevelInfo(String, String, String, String, String)}.
	 */
	@Test
	public final void testGetLevelInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#includeMember(String, String, String, String, String, int, int)}.
	 */
	@Test
	public final void testIncludeMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#removeMember(String, String, String, String, String)}.
	 */
	@Test
	public final void testRemoveMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#includeLevel(String, String, String, String, String, int)}.
	 */
	@Test
	public final void testIncludeLevel() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for {@link org.saiku.web.rest.servlet.QueryServlet#removeLevel(String, String, String, String, String)}.
	 */
	@Test
	public final void testRemoveLevel() {
		fail("Not yet implemented"); // TODO
	}

}

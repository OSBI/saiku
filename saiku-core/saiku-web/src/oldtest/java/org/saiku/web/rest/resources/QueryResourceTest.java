/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package org.saiku.web.rest.resources;

import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.ws.rs.core.Response.Status;

import junit.framework.TestCase;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.saiku.olap.dto.SaikuQuery;
import org.saiku.web.rest.objects.resultset.Cell;
import org.saiku.web.rest.objects.resultset.QueryResult;
import org.saiku.web.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author bugg
 * 
 */

@ContextConfiguration(locations = { "saiku-beans.xml" })
@RunWith(SpringJUnit4ClassRunner.class)
public class QueryResourceTest extends TestCase {

	@Autowired
	private QueryResource qs;
	
	@Autowired
	private SessionService ss;
	
	@Before
	public void setUp() throws Exception {
		    Authentication auth =  new UsernamePasswordAuthenticationToken("testuser", null);
		    SecurityContextHolder.getContext().setAuthentication(auth);
		    ss.login(null, "testuser", null);
	};
	
	@Test
	public final void testCreateQuery() throws ServletException {

		// Create new query
		SaikuQuery testQuery = null;
		testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart",
				"FoodMart",null, "TestQuery1");

		// Check it is not null, has the same name and has an unused axis.
		assertNotNull(testQuery);
		assertEquals("TestQuery1", testQuery.getName());
		assertEquals(testQuery.getSaikuAxes().size(), 3);
		
		// no selections on the axes
		assertEquals(testQuery.getSaikuAxes().get(0).getDimensionSelections().size(), 0);

		

	}

	@Test
	public final void testGetQueries() throws ServletException {
		qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart",
				null,"TestQuery1");
		qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart",
				null,"TestQuery2");

		List<String> queryList = qs.getQueries();
		assertNotNull(queryList);
		assertEquals(queryList.size(), 2);
		assertEquals("TestQuery1", queryList.get(0));
		assertEquals("TestQuery2", queryList.get(1));

	}

	@Test
	public final void testDeleteQuery() throws ServletException {

		// Create 2 Queries
		qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart",
				null,"TestQuery1");
		qs.createQuery("TestConnection1", "Sales", "FoodMart", "FoodMart",
				null,"TestQuery2");

		// Check that the list contains 2 queries
		List<String> queryList = qs.getQueries();
		assertNotNull(queryList);
		assertEquals(queryList.size(), 2);

		// Delete a query
		qs.deleteQuery("TestQuery1");

		// Make sure the query has been removed from the list.
		assertEquals("TestQuery2", qs.getQueries().get(0));
	}

	@Test
	public final void testMoveDimension() throws ServletException {

		// Create a query.
		SaikuQuery testQuery = null;
		testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart",
				"FoodMart", null, "TestQuery1");

		// Check the query isn't null.
		assertNotNull(testQuery);
		
		assertEquals(testQuery.getSaikuAxes().size(), 3);

		// Move a dimension
		Status returnedStatus = qs.moveDimension("TestQuery1", "ROWS", "Store",
				-1);

		// Make sure an OK status was returned.
		assertEquals(Status.OK, returnedStatus);

	}

	@Test
	public final void testExecute() throws ServletException {
		// Create a query.
		SaikuQuery testQuery = null;
		testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart",
				"FoodMart", null, "TestQuery1");

		// Check the query isn't null.
		assertNotNull(testQuery);

		// Move a dimension
		qs.moveDimension("TestQuery1", "ROWS", "Store", -1);
		qs.moveDimension("TestQuery1", "COLUMNS", "Time", -1);

		// Execute the query.
		QueryResult output = qs.execute("TestQuery1");

		// Make sure output is not null.
		assertNotNull(output);

		// Check a cell value
		Cell[] cellarray = output.getCellset().get(0);
		assertEquals("1997", cellarray[1].getValue());
	}

	@Test
	public final void testExecuteMdx() throws ServletException {
		// Create a query.
		SaikuQuery testQuery = null;
		testQuery = qs.createQuery("TestConnection1", "Sales", "FoodMart",
				"FoodMart", null, "TestQuery1");

		// Check the query isn't null.
		assertNotNull(testQuery);
		
		qs.transformQm2Mdx("TestQuery1");

		// Execute the query.
		Long start = (new Date()).getTime();
		QueryResult output = qs.executeMdx("TestQuery1","flattened", 
				"SELECT "
				+ "NON EMPTY {Hierarchize({[Measures].[Profit]})} ON COLUMNS, "
				+ "NON EMPTY {Hierarchize({[Product].[Product Name].Members})} ON ROWS "
				+ "FROM [Sales]");

		Long end = (new Date()).getTime();
		System.out.println("Total: " + (end-start) + "ms");
		// Make sure output is not null.
		assertNotNull(output);

	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#getMDXQuery(String)}.
	 */
	@Test
	@Ignore
	public final void testGetMDXQuery() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#getAxisInfo(String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testGetAxisInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#deleteAxis(String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testDeleteAxis() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#setNonEmpty(String, String, Boolean)}
	 * .
	 */
	@Test
	@Ignore
	public final void testSetNonEmpty() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#setSort(String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testSetSort() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#getDimensionInfo(String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testGetDimensionInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#pullUpDimension(String, String, String, int)}
	 * .
	 */
	@Test
	@Ignore
	public final void testPullUpDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#pushDownDimension(String, String, String, int)}
	 * .
	 */
	@Test
	@Ignore
	public final void testPushDownDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#deleteDimension(String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testDeleteDimension() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#getHierarchyInfo(String, String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testGetHierarchyInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#getLevelInfo(String, String, String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testGetLevelInfo() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#includeMember(String, String, String, String, String, int, int)}
	 * .
	 */
	@Test
	@Ignore
	public final void testIncludeMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#removeMember(String, String, String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testRemoveMember() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#includeLevel(String, String, String, String, String, int)}
	 * .
	 */
	@Test
	@Ignore
	public final void testIncludeLevel() {
		fail("Not yet implemented"); // TODO
	}

	/**
	 * Test method for
	 * {@link org.saiku.web.rest.servlet.QueryServlet#removeLevel(String, String, String, String, String)}
	 * .
	 */
	@Test
	@Ignore
	public final void testRemoveLevel() {
		fail("Not yet implemented"); // TODO
	}

}

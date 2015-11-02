
package org.saiku.service.olap;

import static org.junit.Assert.assertEquals;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringWriter;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.junit.Before;
import org.junit.Test;
import org.olap4j.Axis;
import org.olap4j.CellSet;
import org.olap4j.CellSetAxis;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Measure;
import org.saiku.TestSaikuContext;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinLevel;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.util.Fat;
import org.saiku.olap.query2.util.Thin;
import org.saiku.query.Query;
import org.saiku.query.QueryAxis;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.SortOrder;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.mdx.NFilter;
import org.saiku.query.metadata.CalculatedMeasure;
import org.saiku.service.datasource.DatasourceService;

public class ThinQueryServiceTest {

  private OlapDiscoverService ods;
  private ThinQueryService tqs;

	@Before
	public void setUp() throws Exception {
	  TestSaikuContext context = TestSaikuContext.instance();
		ods = context.olapDiscoverService;
	  DatasourceService ds = context.datasourceService;
		tqs = context.thinQueryService;
	}

	@Test
	public void testNewQuery() throws Exception {
		SaikuCube c = TestSaikuContext.getSalesCube();
		String name = "dummy";
		ThinQuery tq = tqs.createEmpty(name, c);
		ObjectMapper om = new ObjectMapper();
		String query = om.writerWithDefaultPrettyPrinter().writeValueAsString(tq);
		compareQuery(name, query);
	}

	@Test
	public void testQuery1() throws Exception {
		SaikuCube c = TestSaikuContext.getSalesCube();
		Cube cub = ods.getNativeCube(c);
		String name = "query1";
		Query query = new Query(name, cub);
		QueryAxis columns = query.getAxis(Axis.COLUMNS);
		QueryAxis rows = query.getAxis(Axis.ROWS);
		QueryHierarchy products = query.getHierarchy("[Product].[Products]");

		products.includeLevel("Product Family");
		products.excludeMember("[Products].[Non-Consumable]");
		NFilter top2filter = new NFilter(MdxFunctionType.TopCount, 2, "Measures.[Unit Sales]");
		products.addFilter(top2filter);
		columns.addHierarchy(products);

		QueryHierarchy edu = query.getHierarchy("[Customer].[Education Level]");
		edu.includeLevel("Education Level");
		columns.addHierarchy(edu);

		QueryHierarchy gender = query.getHierarchy("[Customer].[Gender]");
		gender.includeMember("[Gender].[F]");
		rows.addHierarchy(gender);

		CalculatedMeasure cm =
				query.createCalculatedMeasure(
						"Double Profit",
						"( [Measures].[Store Sales] - [Measures].[Store Cost]) * 2",
						null);

		columns.sort(SortOrder.BDESC, cm.getUniqueName());

		query.getDetails().add(cm);
		Measure m = cub.getMeasures().get(0);

		query.getDetails().add(m);

		ThinQuery tq = Thin.convert(query, c);

		ObjectMapper om = new ObjectMapper();
		String first = om.writerWithDefaultPrettyPrinter().writeValueAsString(tq);

		Query q2 = Fat.convert(tq, cub);
		ThinQuery tq2 = Thin.convert(q2, c);
		String second = om.writerWithDefaultPrettyPrinter().writeValueAsString(tq2);

		assertEquals(first, second);
		compareQuery(name, second);

		String mdx = q2.getSelect().toString();

		String expectedMdx =
				"WITH\n" +
						"SET [~COLUMNS_Products] AS\n" +
						"    TopCount(Except({[Product].[Products].[Product Family].Members}, {[Product].[Products].[Non-Consumable]}), 2, Measures.[Unit Sales])\n" +
						"SET [~COLUMNS_Education Level] AS\n" +
						"    {[Customer].[Education Level].[Education Level].Members}\n" +
						"MEMBER [Measures].[Double Profit] AS\n" +
						"    (([Measures].[Store Sales] - [Measures].[Store Cost]) * 2)\n" +
						"SET [~ROWS] AS\n" +
						"    {[Customer].[Gender].[F]}\n" +
						"SELECT\n" +
						"CrossJoin(Order(CrossJoin([~COLUMNS_Products], [~COLUMNS_Education Level]), [Measures].[Double Profit], BDESC), {[Measures].[Double Profit], [Measures].[Unit Sales]}) ON COLUMNS,\n" +
						"[~ROWS] ON ROWS\n" +
						"FROM [Sales]";

		assertEquals(expectedMdx, mdx);

		CellSet cs = this.tqs.executeInternalQuery(tq2);
		assertEquals("[ COLUMNS: 20 ][ ROWS: 1 ]", getResultInfo(cs));
	}

	@Test
	public void testBasicParameter1() throws Exception {
		SaikuCube c = TestSaikuContext.getSalesCube();
		Cube cub = ods.getNativeCube(c);
		String name = "parameter1";
		Query query = new Query(name, cub);
		QueryAxis columns = query.getAxis(Axis.COLUMNS);
		QueryAxis rows = query.getAxis(Axis.ROWS);
		QueryHierarchy products = query.getHierarchy("[Product].[Products]");
		products.includeLevel("Product Family");
		products.excludeMember("[Products].[Non-Consumable]");
		rows.addHierarchy(products);

		QueryHierarchy edu = query.getHierarchy("[Customer].[Education Level]");
		edu.includeLevel("Education Level");
		columns.addHierarchy(edu);

		ThinQuery tq = Thin.convert(query, c);
		ThinLevel tl = tq.getQueryModel().getAxis(AxisLocation.ROWS).getHierarchy("[Product].[Products]").getLevel("Product Family");
		tl.getSelection().setParameterName("productFamilyList");
		tq.setParameter("productFamilyList", "[Product].[Products].[Food]");


		ObjectMapper om = new ObjectMapper();
		String first = om.writerWithDefaultPrettyPrinter().writeValueAsString(tq);

		compareQuery(name, first);

		Query q2 = Fat.convert(tq, cub);

		String mdx = q2.getSelect().toString();

		String expectedMdx =
				"WITH\n" +
						"SET [~COLUMNS] AS\n" +
						"    {[Customer].[Education Level].[Education Level].Members}\n" +
						"SET [~ROWS] AS\n" +
						"    Except({[Product].[Products].[Product Family].Members}, {[Product].[Products].[Food]})\n" +
						"SELECT\n" +
						"[~COLUMNS] ON COLUMNS,\n" +
						"[~ROWS] ON ROWS\n" +
						"FROM [Sales]";

		assertEquals(expectedMdx, mdx);

		CellSet cs = tqs.executeInternalQuery(tq);
		//		String s = TestUtil.toString(cs);
		////			        System.out.println(TestUtil.toJavaString(s));
		//		TestUtil.assertEqualsVerbose(
		//				"Axis #0:\n"
		//		                + "{}\n"
		//		                + "Axis #1:\n"
		//		                + "{[Education Level].[Bachelors Degree]}\n"
		//		                + "{[Education Level].[Graduate Degree]}\n"
		//		                + "{[Education Level].[High School Degree]}\n"
		//		                + "{[Education Level].[Partial College]}\n"
		//		                + "{[Education Level].[Partial High School]}\n"
		//		                + "Axis #2:\n"
		//		                + "{[Product].[Drink]}\n"
		//		                + "{[Product].[Non-Consumable]}\n"
		//		                + "Row #0: 6,423\n"
		//		                + "Row #0: 1,325\n"
		//		                + "Row #0: 7,226\n"
		//		                + "Row #0: 2,164\n"
		//		                + "Row #0: 7,459\n"
		//		                + "Row #1: 13,051\n"
		//		                + "Row #1: 2,990\n"
		//		                + "Row #1: 14,929\n"
		//		                + "Row #1: 4,522\n"
		//		                + "Row #1: 14,744\n",
		//						s);
		assertEquals("[ COLUMNS: 5 ][ ROWS: 2 ]", getResultInfo(cs));

		tq.setParameter("productFamilyList", "[Product].[Products].[Food],[Product].[Products].[Drink]");
		q2 = Fat.convert(tq, cub);
		mdx = q2.getSelect().toString();

		expectedMdx =
				"WITH\n" +
						"SET [~COLUMNS] AS\n" +
						"    {[Customer].[Education Level].[Education Level].Members}\n" +
						"SET [~ROWS] AS\n" +
						"    Except({[Product].[Products].[Product Family].Members}, {[Product].[Products].[Food], [Product].[Products].[Drink]})\n" +
						"SELECT\n" +
						"[~COLUMNS] ON COLUMNS,\n" +
						"[~ROWS] ON ROWS\n" +
						"FROM [Sales]";

		assertEquals(expectedMdx, mdx);

		cs = tqs.executeInternalQuery(tq);
		assertEquals("[ COLUMNS: 5 ][ ROWS: 1 ]", getResultInfo(cs));
	}

	@Test
	public void testMdxQuery1() throws Exception {
		SaikuCube c = TestSaikuContext.getSalesCube();
		String name = "mdx1";
		String mdx = "SELECT Gender.Members on COLUMNS, Measures.Profit on ROWS from Sales";
		ThinQuery tq = new ThinQuery(name, c, mdx);
		ObjectMapper om = new ObjectMapper();
		String first = om.writerWithDefaultPrettyPrinter().writeValueAsString(tq);

		compareQuery(name, first);

		CellSet cs = this.tqs.executeInternalQuery(tq);
		assertEquals("[ COLUMNS: 3 ][ ROWS: 1 ]", getResultInfo(cs));

		Cube cube = ods.getNativeCube(c);
		Query q = Fat.convert(tq, cube);

		//		File f = new File("/tmp/" + name + ".json");
		//		FileWriter fw = new FileWriter(f);
		//		fw.write(second);
		//		fw.flush();
		//		fw.close();
	}

	private String getResultInfo(CellSet cs ) {
		String ret = "";
		for (CellSetAxis ca : cs.getAxes()) {
			ret += "[ " +  ca.getAxisOrdinal().name() + ": " + ca.getPositionCount() + " ]";
		}
		return ret;
	}

	private void compareQuery(String name, String actual) throws IOException {
		StringWriter stringWriter = new StringWriter();
		FileSystemManager fileSystemManager = VFS.getManager();
		FileObject fileObject = fileSystemManager.resolveFile("res:queries/" + name + ".json");
		IOUtils.copy(fileObject.getContent().getInputStream(), stringWriter);
		String expected = stringWriter.toString();
		assertEquals(expected, actual);
	}
}

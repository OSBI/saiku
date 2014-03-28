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
package org.saiku.service.olap;

import java.io.PrintWriter;
import java.io.Serializable;
import java.io.StringWriter;
import java.io.Writer;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.lang.StringUtils;
import org.olap4j.CellSet;
import org.olap4j.CellSetAxis;
import org.olap4j.OlapConnection;
import org.olap4j.OlapStatement;
import org.olap4j.Position;
import org.olap4j.mdx.ParseTreeNode;
import org.olap4j.mdx.ParseTreeWriter;
import org.olap4j.mdx.SelectNode;
import org.olap4j.mdx.parser.impl.DefaultMdxParserImpl;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SimpleCubeElement;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query2.ThinHierarchy;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.util.Fat;
import org.saiku.olap.query2.util.Thin;
import org.saiku.olap.util.ObjectUtil;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.SaikuUniqueNameComparator;
import org.saiku.olap.util.formatter.CellSetFormatterFactory;
import org.saiku.olap.util.formatter.FlattenedCellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.query.Query;
import org.saiku.query.util.QueryUtil;
import org.saiku.service.util.KeyValue;
import org.saiku.service.util.QueryContext;
import org.saiku.service.util.QueryContext.ObjectKey;
import org.saiku.service.util.QueryContext.Type;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.service.util.export.CsvExporter;
import org.saiku.service.util.export.ExcelExporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ThinQueryService implements Serializable {

	/**
	 * Unique serialization UID 
	 */
	private static final long serialVersionUID = -7615296596528274904L;

	private static final Logger log = LoggerFactory.getLogger(ThinQueryService.class);

	private OlapDiscoverService olapDiscoverService;
	
	private CellSetFormatterFactory cff = new CellSetFormatterFactory();
	
	private Map<String, QueryContext> context = new HashMap<String, QueryContext>();

	public void setOlapDiscoverService(OlapDiscoverService os) {
		this.olapDiscoverService = os;
	}
	
	public void setCellSetFormatterFactory(CellSetFormatterFactory cff) {
		this.cff = cff;
	}
 


	public ThinQuery createQuery(ThinQuery tq) throws Exception {
		if (StringUtils.isBlank(tq.getName())) {
			tq.setName(UUID.randomUUID().toString());
		}
		Map<String, Object> cubeProperties = olapDiscoverService.getProperties(tq.getCube());
		tq.getProperties().putAll(cubeProperties);
		if (!context.containsKey(tq.getName())) {
//			Cube cub = olapDiscoverService.getNativeCube(tq.getCube());
//			Query query = new Query(tq.getName(), cub);
//			tq = Thin.convert(query, tq.getCube());
			QueryContext qt = new QueryContext(Type.OLAP, tq);
			qt.store(ObjectKey.QUERY, tq);
			this.context.put(tq.getName(), qt);
		}
		return tq;
	}
	
	public QueryContext getContext(String name) {
		return this.context.get(name);
	}

	@Deprecated
	public ThinQuery createEmpty(String name, SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);
			Query query = new Query(name, cub);
			ThinQuery tq = Thin.convert(query, cube);
			return tq;

		} catch (Exception e) {
			log.error("Cannot create new query for cube :" + cube, e);
		}
		return null;

	}


	
	protected CellSet executeInternalQuery(ThinQuery query) throws Exception {
		QueryContext queryContext = context.get(query.getName());
		
		if (queryContext == null) {
			queryContext = new QueryContext(Type.OLAP, query);
			this.context.put(query.getName(), queryContext);
		}
				
		OlapConnection con = olapDiscoverService.getNativeConnection(query.getCube().getConnection());
		if (StringUtils.isNotBlank(query.getCube().getCatalog())) {
			con.setCatalog(query.getCube().getCatalog());
		}
		
		if (queryContext.contains(ObjectKey.STATEMENT)) {
			Statement s = queryContext.getStatement();
			s.cancel();
			s.close();
			s = null;
			queryContext.remove(ObjectKey.STATEMENT);
		}
		
		OlapStatement stmt = con.createStatement();
		queryContext.store(ObjectKey.STATEMENT, stmt);
		
		query = updateQuery(query);
		
		try {
			String mdx = query.getParameterResolvedMdx();
			CellSet cs = stmt.executeOlapQuery(mdx);
			queryContext.store(ObjectKey.RESULT, cs);
			if (query != null) {
				queryContext.store(ObjectKey.QUERY, query);
			}
			return cs;
		} finally {
			stmt.close();
			queryContext.remove(ObjectKey.STATEMENT);
		}
	}
	
	public CellDataSet execute(ThinQuery tq) {
		if (tq.getProperties().containsKey("saiku.olap.result.formatter")) {
			return execute(tq, tq.getProperties().get("saiku.olap.result.formatter").toString());
		}
		return execute(tq, "");
	}

	public CellDataSet execute(ThinQuery tq, String formatter) {
		String formatterName = formatter == null ? "" : formatter.toLowerCase();
		ICellSetFormatter cf = cff.forName(formatterName);
		return execute(tq, cf);
	}

	public CellDataSet execute(ThinQuery tq, ICellSetFormatter formatter) {
		try {
			Long start = (new Date()).getTime();
			CellSet cellSet =  executeInternalQuery(tq);
			Long exec = (new Date()).getTime();

			CellDataSet result = OlapResultSetUtil.cellSet2Matrix(cellSet,formatter);
			Long format = (new Date()).getTime();
			log.info("Size: " + result.getWidth() + "/" + result.getHeight() + "\tExecute:\t" + (exec - start)
					+ "ms\tFormat:\t" + (format - exec) + "ms\t Total: " + (format - start) + "ms");
			result.setRuntime(new Double(format - start).intValue());
			return result;
		} catch (Exception e) {
			throw new SaikuServiceException("Can't execute query: " + tq.getName(),e);
		} catch (Error e) {
			throw new SaikuServiceException("Can't execute query: " + tq.getName(),e);
		}
	}
	
	public void cancel(String name) throws SQLException {
		if (context.containsKey(name)) {
			QueryContext queryContext = context.get(name);
			if (queryContext.contains(ObjectKey.STATEMENT)) {
				Statement stmt = queryContext.getStatement();
				if (stmt != null && !stmt.isClosed()) {
					stmt.cancel();
					stmt.close();
				}
				stmt = null;
				queryContext.remove(ObjectKey.STATEMENT);
			}
		}
	}

	public ThinQuery updateQuery(ThinQuery old) throws Exception {
		if (ThinQuery.Type.QUERYMODEL.equals(old.getType())) {
			Cube cub = olapDiscoverService.getNativeCube(old.getCube());
			Query q = Fat.convert(old, cub);
			ThinQuery tqAfter = Thin.convert(q, old.getCube());
			old.setQueryModel(tqAfter.getQueryModel());
			old.setMdx(tqAfter.getMdx());
		}
		if (context.containsKey(old.getName())) {
			QueryContext qc = context.get(old.getName());
			qc.store(ObjectKey.QUERY, old);
		}
		String mdx = old.getMdx();
		List<String> params = QueryUtil.parseParameters(mdx);
		old.addParameters(params);
		
		Map<String, Object> cubeProperties = olapDiscoverService.getProperties(old.getCube());
		old.getProperties().putAll(cubeProperties);

		return old;
	}

	public void deleteQuery(String queryName) {
		try {
			if (context.containsKey(queryName)) {
				QueryContext qc = context.remove(queryName);
				qc.destroy();
			}
		} catch (Exception e) {
			throw new SaikuServiceException(e);
		}
	}
	
	public byte[] getExport(String queryName, String type) {
		return getExport(queryName,type,new FlattenedCellSetFormatter());
	}

	public byte[] getExport(String queryName, String type, String formatter) {
		String formatterName = formatter == null ? "" : formatter.toLowerCase();
		ICellSetFormatter cf = cff.forName(formatterName);
		return getExport(queryName, type, cf);
	}

	public byte[] getExport(String queryName, String type, ICellSetFormatter formatter) {
		if (StringUtils.isNotBlank(type) && context.containsKey(queryName)) {
			CellSet rs = context.get(queryName).getOlapResult();
			ThinQuery tq = context.get(queryName).getOlapQuery();
			List<ThinHierarchy> filterHierarchies = null;
			if (ThinQuery.Type.QUERYMODEL.equals(tq.getType())) {
				filterHierarchies = tq.getQueryModel().getAxes().get(AxisLocation.FILTER).getHierarchies();
			}
			if (type.toLowerCase().equals("xls")) {
				return ExcelExporter.exportExcel(rs, formatter, filterHierarchies);
			}
			if (type.toLowerCase().equals("csv")) {
				return CsvExporter.exportCsv(rs,",","\"", formatter);
			}
		}
		return new byte[0];
	}
	
	public ResultSet drillthrough(String queryName, int maxrows, String returns) {
		OlapStatement stmt = null;
		try {
				
			ThinQuery query = context.get(queryName).getOlapQuery();
			final OlapConnection con = olapDiscoverService.getNativeConnection(query.getCube().getConnection()); 
			stmt = con.createStatement();
			String mdx = query.getMdx();
			if (maxrows > 0) {
				mdx = "DRILLTHROUGH MAXROWS " + maxrows + " " + mdx;
			}
			else {
				mdx = "DRILLTHROUGH " + mdx;
			}
			if (StringUtils.isNotBlank(returns)) {
				mdx += "\r\n RETURN " + returns;
			}
			ResultSet rs = stmt.executeQuery(mdx);
			return rs;
		} catch (SQLException e) {
			throw new SaikuServiceException("Error DRILLTHROUGH: " + queryName,e);
		} finally {
			try {
				if (stmt != null)  stmt.close();
			} catch (Exception e) {}
		}
	}

	public ResultSet drillthrough(String queryName, List<Integer> cellPosition, Integer maxrows, String returns) {
		OlapStatement stmt = null;
		try {
			QueryContext queryContext = context.get(queryName);
			ThinQuery query = queryContext.getOlapQuery();
			CellSet cs = queryContext.getOlapResult();
			SaikuCube cube = query.getCube();
			final OlapConnection con = olapDiscoverService.getNativeConnection(cube.getConnection()); 
			stmt = con.createStatement();
			
			SelectNode sn = (new DefaultMdxParserImpl().parseSelect(query.getMdx()));
			String select = null;
			StringBuffer buf = new StringBuffer();
			if (sn.getWithList() != null && sn.getWithList().size() > 0) {
	            buf.append("WITH \n");
	            StringWriter sw = new StringWriter();
	            ParseTreeWriter ptw = new ParseTreeWriter(sw);
	            final PrintWriter pw = ptw.getPrintWriter();
	            for (ParseTreeNode with : sn.getWithList()) {
	                with.unparse(ptw);
	                pw.println();
	            }
	            buf.append(sw.toString());
			}
			
			buf.append("SELECT (");
			for (int i = 0; i < cellPosition.size(); i++) {
				List<Member> members = cs.getAxes().get(i).getPositions().get(cellPosition.get(i)).getMembers();
				for (int k = 0; k < members.size(); k++) {
					Member m = members.get(k);
					if (k > 0 || i > 0) {
						buf.append(", ");
					}
					buf.append(m.getUniqueName());
				}
			}
			buf.append(") ON COLUMNS \r\n");
			buf.append("FROM [" + cube.getName() + "]\r\n");

			 
			final Writer writer = new StringWriter();
			sn.getFilterAxis().unparse(new ParseTreeWriter(new PrintWriter(writer)));
			if (StringUtils.isNotBlank(writer.toString())) {
				buf.append("WHERE " + writer.toString());
			}
			select = buf.toString(); 
			if (maxrows > 0) {
				select = "DRILLTHROUGH MAXROWS " + maxrows + " " + select + "\r\n";
			}
			else {
				select = "DRILLTHROUGH " + select + "\r\n";
			}
			if (StringUtils.isNotBlank(returns)) {
				select += "\r\n RETURN " + returns;
			}

			log.debug("Drill Through for query (" + queryName + ") : \r\n" + select);
			ResultSet rs = stmt.executeQuery(select);
			return rs;
		} catch (Exception e) {
			throw new SaikuServiceException("Error DRILLTHROUGH: " + queryName,e);
		} finally {
			try {
				if (stmt != null)  stmt.close();
			} catch (Exception e) {}
		}

	}


	public byte[] exportDrillthroughCsv(String queryName, int maxrows) {
		OlapStatement stmt = null;
		try {
			QueryContext queryContext = context.get(queryName);
			ThinQuery query = queryContext.getOlapQuery();
			final OlapConnection con = olapDiscoverService.getNativeConnection(query.getCube().getConnection()); 
			stmt = con.createStatement();
			String mdx = query.getMdx();
			if (maxrows > 0) {
				mdx = "DRILLTHROUGH MAXROWS " + maxrows + " " + mdx;
			}
			else {
				mdx = "DRILLTHROUGH " + mdx;
			}

			ResultSet rs = stmt.executeQuery(mdx);
			return CsvExporter.exportCsv(rs);
		} catch (SQLException e) {
			throw new SaikuServiceException("Error DRILLTHROUGH: " + queryName,e);
		} finally {
			try {
				if (stmt != null)  stmt.close();
			} catch (Exception e) {}
		}

	}
	
	public byte[] exportResultSetCsv(ResultSet rs) {
		return CsvExporter.exportCsv(rs);
	}
	
	public byte[] exportResultSetCsv(ResultSet rs, String delimiter, String enclosing, boolean printHeader, List<KeyValue<String,String>> additionalColumns) {
		return CsvExporter.exportCsv(rs, delimiter, enclosing, printHeader, additionalColumns);
	}



	public List<SimpleCubeElement> getResultMetadataMembers(
				String queryName,
				boolean preferResult, 
				String hierarchyName, 
				String levelName,
				String searchString, 
				int searchLimit) {
		
		if (context.containsKey(queryName)) {
			CellSet cs = context.get(queryName).getOlapResult();
			List<SimpleCubeElement> members = new ArrayList<SimpleCubeElement>();
			Set<Level> levels = new HashSet<Level>();
			boolean search = StringUtils.isNotBlank(searchString);
			preferResult = (preferResult && !search);
			searchString = search ? searchString.toLowerCase() : null;

			if (cs != null && preferResult) {
				for (CellSetAxis axis : cs.getAxes()) {
					int posIndex = 0;
					for (Hierarchy h : axis.getAxisMetaData().getHierarchies()) {
						if (h.getUniqueName().equals(hierarchyName) || h.getName().equals(hierarchyName)) {
							log.debug("Found hierarchy in the result: " + hierarchyName);
							if (h.getLevels().size() == 1) {
								break;
							}
							Set<Member> mset = new HashSet<Member>();
							for (Position pos : axis.getPositions()) {
								Member m = pos.getMembers().get(posIndex);
								if (!m.getLevel().getLevelType().equals(org.olap4j.metadata.Level.Type.ALL)) {
									levels.add(m.getLevel());
								}
								if (m.getLevel().getUniqueName().equals(levelName) || m.getLevel().getName().equals(levelName)) {
									mset.add(m);
								}
							}

							members = ObjectUtil.convert2Simple(mset);
							Collections.sort(members, new SaikuUniqueNameComparator());

							break;
						}
						posIndex++;
					}
				}
				log.debug("Found members in the result: " + members.size());

			}
			if (cs == null || !preferResult || members.size() == 0 || levels.size() == 1) {
				members = olapDiscoverService.getLevelMembers(context.get(queryName).getOlapQuery().getCube(), hierarchyName, levelName, searchString, searchLimit);
			}
			return members;
		}
		return null;
	}
}

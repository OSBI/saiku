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

import java.io.Serializable;
import java.sql.Statement;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang.StringUtils;
import org.olap4j.CellSet;
import org.olap4j.OlapConnection;
import org.olap4j.OlapStatement;
import org.olap4j.metadata.Cube;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.util.Fat;
import org.saiku.olap.query2.util.Thin;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.formatter.CellSetFormatterFactory;
import org.saiku.olap.util.formatter.HierarchicalCellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.query.Query;
import org.saiku.service.util.QueryContext;
import org.saiku.service.util.QueryContext.ObjectKey;
import org.saiku.service.util.QueryContext.Type;
import org.saiku.service.util.exception.SaikuServiceException;
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
 


	public ThinQuery storeQuery(ThinQuery tq) throws Exception {
		if (StringUtils.isBlank(tq.getName())) {
			tq.setName(UUID.randomUUID().toString());
		}
		if (!context.containsKey(tq.getName())) {
//			Cube cub = olapDiscoverService.getNativeCube(tq.getCube());
//			Query query = new Query(tq.getName(), cub);
//			tq = Thin.convert(query, tq.getCube());
			QueryContext qt = new QueryContext(Type.OLAP, tq);
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
		ThinQuery tqAfter = null;
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
		
		String mdx = null;
		if (ThinQuery.Type.MDX.equals(query.getType())) {
			mdx = query.getMdx();
		} else if (ThinQuery.Type.QUERYMODEL.equals(query.getType())) {
			Cube cub = olapDiscoverService.getNativeCube(query.getCube());
			Query q = Fat.convert(query, cub);
			mdx = q.getMdx();
			tqAfter = Thin.convert(q, query.getCube());
			query.setQueryModel(tqAfter.getQueryModel());
			
		} else {
			throw new Exception("Cannot get mdx for query " + query.getName() + " - no querymodel or mdx present!");
		}
		
		try {
			query.setMdx(mdx);
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
			return execute(tq, tq.getProperties().get("saiku.olap.result.formatter"));
		}
		return execute(tq,new HierarchicalCellSetFormatter());
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
}

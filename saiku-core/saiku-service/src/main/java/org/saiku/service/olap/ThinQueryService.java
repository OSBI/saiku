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
import java.util.Date;

import org.apache.commons.lang.StringUtils;
import org.olap4j.Axis;
import org.olap4j.CellSet;
import org.olap4j.OlapConnection;
import org.olap4j.OlapStatement;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Measure;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.util.Fat;
import org.saiku.olap.query2.util.Thin;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.formatter.CellSetFormatter;
import org.saiku.olap.util.formatter.FlattenedCellSetFormatter;
import org.saiku.olap.util.formatter.HierarchicalCellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.query.Query;
import org.saiku.query.QueryAxis;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.SortOrder;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.mdx.NFilter;
import org.saiku.query.metadata.CalculatedMeasure;
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

	public void setOlapDiscoverService(OlapDiscoverService os) {
		olapDiscoverService = os;
	}

	
	protected CellSet executeInternalQuery(ThinQuery query) throws Exception {
		
		OlapConnection con = olapDiscoverService.getNativeConnection(query.getCube().getConnectionName());
		con.setCatalog(query.getCube().getCatalogName());
		OlapStatement stmt = con.createStatement();
		
		String mdx = null;
		if (ThinQuery.Type.MDX.equals(query.getType())) {
			mdx = query.getMdx();
		} else if (ThinQuery.Type.QUERYMODEL.equals(query.getType())) {
			Cube cub = olapDiscoverService.getNativeCube(query.getCube());
			Query q = Fat.convert(query, cub);
			mdx = q.getMdx();
		} else {
			throw new Exception("Cannot get mdx for query " + query.getName() + " - no querymodel or mdx present!");
		}
		
		try {	
			CellSet cs = stmt.executeOlapQuery(mdx);
			stmt.close();
			return cs;
		} finally {
			stmt.close();
		}
	}
	
	public CellDataSet execute(ThinQuery tq) {
		return execute(tq,new HierarchicalCellSetFormatter());
	}

	public CellDataSet execute(ThinQuery tq, String formatter) {
		formatter = formatter == null ? "" : formatter.toLowerCase(); 
		if(formatter.equals("flat")) {
			return execute(tq, new CellSetFormatter());
		}
		else if (formatter.equals("hierarchical")) {
			return execute(tq, new HierarchicalCellSetFormatter());
		}
		else if (formatter.equals("flattened")) {
			return execute(tq, new FlattenedCellSetFormatter());
		}
		return execute(tq, new HierarchicalCellSetFormatter());
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

	

}

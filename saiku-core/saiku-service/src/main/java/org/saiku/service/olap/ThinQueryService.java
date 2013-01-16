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
import java.util.List;

import org.olap4j.Axis;
import org.olap4j.CellSet;
import org.olap4j.CellSetAxis;
import org.olap4j.OlapConnection;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Measure;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.util.Fat;
import org.saiku.olap.query2.util.Thin;
import org.saiku.query.Query;
import org.saiku.query.QueryAxis;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.SortOrder;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.mdx.NFilter;
import org.saiku.query.metadata.CalculatedMeasure;
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

	public ThinQuery createDummyQuery(SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);

			Query query = new Query("dummy query", cub);
			QueryAxis columns = query.getAxis(Axis.COLUMNS);
			QueryAxis rows = query.getAxis(Axis.ROWS);
			QueryHierarchy products = query.getHierarchy("Product");

			products.includeLevel("Product Family");
			products.excludeMember("[Product].[Non-Consumable]");
			NFilter top2filter = new NFilter(MdxFunctionType.TopCount, 2, "Measures.[Unit Sales]");
			products.addFilter(top2filter);
			columns.addHierarchy(products);

			QueryHierarchy edu = query.getHierarchy("Education Level");
			edu.includeLevel("Education Level");
			columns.addHierarchy(edu);

			QueryHierarchy gender = query.getHierarchy("Gender");
			gender.includeMember("[Gender].[F]");
			rows.addHierarchy(gender);
			rows.sort(SortOrder.DESC);

			CalculatedMeasure cm =
					query.createCalculatedMeasure(
							"Double Profit", 
							"( [Measures].[Store Sales] - [Measures].[Store Cost]) * 2",  
							null);


			query.getDetails().add(cm);
			Measure m = cub.getMeasures().get(0);

			query.getDetails().add(m);

			ThinQuery tq = Thin.convert(query, cube);
			return tq;

		} catch (Exception e) {
			log.error("Cannot create new query for cube :" + cube,e);
		}
		return null;

	}


	public ThinQuery createEmpty(SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);
			OlapConnection con = olapDiscoverService.getNativeConnection(cube.getConnectionName());

			Query query = new Query("dummy query", cub);

			ThinQuery tq = Thin.convert(query, cube);
			return tq;

		} catch (Exception e) {
			log.error("Cannot create new query for cube :" + cube,e);
		}
		return null;

	}

	public String executeDummyQuery(SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);
			ThinQuery tq = createDummyQuery(cube);
			Query q = Fat.convert(tq, cub);
			CellSet cs = q.execute();
			String ret = "";
			for (CellSetAxis ca : cs.getAxes()) {
				ret += "[ " +  ca.getAxisOrdinal().name() + ": " + ca.getPositionCount() + " ]";
			}
			return ret;
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
	}

}

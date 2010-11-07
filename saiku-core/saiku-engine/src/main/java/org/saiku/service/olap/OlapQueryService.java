package org.saiku.service.olap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.metadata.Cube;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.saiku.olap.discover.pojo.ICubePojo;
import org.saiku.olap.query.IAxis;
import org.saiku.olap.query.OlapQuery;
import org.saiku.olap.query.IAxis.Standard;

public class OlapQueryService {
	
	private OlapDiscoverService olapDiscoverService;
	
	private Map<String,OlapQuery> queries = new HashMap<String,OlapQuery>();
	
	public void setOlapDiscoverService(OlapDiscoverService os) {
		olapDiscoverService = os;
	}
	
	public boolean createNewOlapQuery(String queryName, ICubePojo cube) {
		try {
			Cube cub = olapDiscoverService.getCube(cube);
			if (cub != null) {
				queries.put(queryName, new OlapQuery(new Query(queryName, cub)));
				return true;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;

	}
	
	public List<String> getQueries() {
		List<String> queryList = new ArrayList<String>();
		queryList.addAll(queries.keySet());
		return queryList;
	}
	
	public void deleteQuery(String queryName) {
		queries.remove(queryName);
	}
	
	public void pivot(String queryName) {
		queries.get(queryName).pivot();
	}
	
	public List<String> getAxes() {
		List<String> axes = new ArrayList<String>();
		for (Standard axis : IAxis.Standard.values()) {
			axes.add(axis.toString());
		}
		return axes;
	}
	
	public List<String> getDimensions(String queryName, String axis) {
		OlapQuery q = queries.get(queryName);
		IAxis tmpAxis = IAxis.forName(axis);
		List<String> dimensions = new ArrayList<String>();

		if (tmpAxis != null) {
			int ord = tmpAxis.axisOrdinal();
			QueryAxis qa = q.getAxis(Axis.Factory.forOrdinal(ord));
			for (QueryDimension dim : qa.getDimensions()) {
				dimensions.add(dim.getName());
			}
		}
		return dimensions;
		
	}
	
	public List<String> getDimension(String queryName, String axis) {
		OlapQuery q = queries.get(queryName);
		IAxis tmpAxis = IAxis.forName(axis);
		List<String> dimensions = new ArrayList<String>();

		if (tmpAxis != null) {
			int ord = tmpAxis.axisOrdinal();
			QueryAxis qa = q.getAxis(Axis.Factory.forOrdinal(ord));
			for (QueryDimension dim : qa.getDimensions()) {
				dimensions.add(dim.getName());
			}
		}
		return dimensions;
		
	}

}

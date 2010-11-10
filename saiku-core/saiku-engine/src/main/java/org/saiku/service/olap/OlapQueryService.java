package org.saiku.service.olap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.OlapException;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
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
	
	public void closeQuery(String queryName) {
		queries.remove(queryName);
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
	
	public void moveDimension(String queryName, String axisName, String dimensionName) {
		OlapQuery query = queries.get(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		Axis newAxis = Axis.Standard.valueOf(axisName);
		query.moveDimension(dimension, newAxis);
	}
	
	public void removeDimension(String queryName, String axisName, String dimensionName) {
		OlapQuery query = queries.get(queryName);
		String unusedName = query.getUnusedAxis().getName();
		moveDimension(queryName, unusedName , dimensionName);
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
	
	public List<String> getHierarchies(String queryName, String dimensionName) {
		OlapQuery q = queries.get(queryName);
		List<String> hierarchies = new ArrayList<String>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			for (Hierarchy hierarchy : dim.getDimension().getHierarchies()) {
				hierarchies.add(hierarchy.getName());
			}
		}
		return hierarchies;
	}
	
	public List<String> getLevels(String queryName, String dimensionName, String hierarchyName) {
		OlapQuery q = queries.get(queryName);
		List<String> levels = new ArrayList<String>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			Hierarchy hierarchy = dim.getDimension().getHierarchies().get(hierarchyName);
			for (Level level : hierarchy.getLevels()) {
				levels.add(level.getName());
			}
		}
		return levels;
	}
	
	public List<String> getLevelMembers(String queryName, String dimensionName, String hierarchyName, String levelName) {
		OlapQuery q = queries.get(queryName);
		List<String> members = new ArrayList<String>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			Hierarchy hierarchy = dim.getDimension().getHierarchies().get(hierarchyName);
			Level level =  hierarchy.getLevels().get(levelName);
			try {
				for (Member member : level.getMembers()) {
					members.add(member.getName());
				}
			} catch (OlapException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return members;
	}
	
	public void clearQuery(String queryName) {
		OlapQuery query = queries.get(queryName);
		clearAllQuerySelections(query);
	}
	
	public void clearAxis(String queryName, String axisName) {
		OlapQuery query = queries.get(queryName);
		if (Axis.Standard.valueOf(axisName) != null) {
			QueryAxis qAxis = query.getAxis(Axis.Standard.valueOf(axisName));
			clearAllAxisSelections(qAxis);
		}
		clearAllQuerySelections(query);
	}
			
	private void clearAllAxisSelections(QueryAxis axis) {
		for (QueryDimension dim : axis.getDimensions()) {
			dim.clearInclusions();
			dim.clearExclusions();
			dim.clearSort();
		}
	}
	
	private void clearAllQuerySelections(OlapQuery query) {
		clearAllAxisSelections(query.getUnusedAxis());
		Map<Axis,QueryAxis> axes = query.getAxes();
		for (Axis axis : axes.keySet()) {
			clearAllAxisSelections(axes.get(axis));
		}
	}

}

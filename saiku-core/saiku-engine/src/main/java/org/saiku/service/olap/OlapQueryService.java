package org.saiku.service.olap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.OlapException;
import org.olap4j.Axis.Standard;
import org.olap4j.mdx.IdentifierNode;
import org.olap4j.mdx.IdentifierSegment;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.olap4j.query.Selection;
import org.olap4j.query.SortOrder;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query.OlapQuery;
import org.saiku.olap.util.ObjectUtil;

public class OlapQueryService {
	
	private OlapDiscoverService olapDiscoverService;
	
	private Map<String,OlapQuery> queries = new HashMap<String,OlapQuery>();
	
	public void setOlapDiscoverService(OlapDiscoverService os) {
		olapDiscoverService = os;
	}
	
	public boolean createNewOlapQuery(String queryName, SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);
			if (cub != null) {
				OlapQuery q = new OlapQuery(new Query(queryName, cub));
				queries.put(queryName, q);
				
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
	
	public CellDataSet execute(String queryName) {
		OlapQuery query = queries.get(queryName);
		try {
			return query.execute();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	public void pivot(String queryName) {
		queries.get(queryName).pivot();
	}
	
	public List<String> getAxes() {
		List<String> axes = new ArrayList<String>();
		for (Standard axis : Axis.Standard.values()) {
			axes.add(axis.toString());
		}
		return axes;
	}
	
	public List<SaikuDimension> getDimensions(String queryName, String axis) {
		OlapQuery q = queries.get(queryName);
		Axis.Standard tmpAxis = null;
		List<SaikuDimension> dimensions = new ArrayList<SaikuDimension>();
		
		if(!axis.equals("UNUSED")) {
			tmpAxis = Standard.valueOf(axis);
		}
		if (tmpAxis != null) {
			int ord = tmpAxis.axisOrdinal();
			QueryAxis qa = q.getAxis(Axis.Factory.forOrdinal(ord));
			dimensions.addAll(ObjectUtil.convertQueryDimensions(qa.getDimensions()));
			
		}
		else if (axis.equals("UNUSED")){
            QueryAxis qa = q.getUnusedAxis();
            dimensions.addAll(ObjectUtil.convertQueryDimensions(qa.getDimensions()));
        }
		return dimensions;
		
	}
	
	public boolean includeMember(String queryName, String dimensionName, String uniqueMemberName, String selectionType){
	    OlapQuery query = queries.get(queryName);
	    List<IdentifierSegment> memberList = IdentifierNode.parseIdentifier(uniqueMemberName).getSegmentList();
        QueryDimension dimension = query.getDimension(dimensionName);
        final Selection.Operator selectionMode = Selection.Operator.valueOf(selectionType);
        
        try {
        	System.out.println("include:" + selectionMode.toString() + " " + memberList.size());
            dimension.include(selectionMode, memberList);
            return true;
        } catch (OlapException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            return false;
        }
	}
	
	
	public void moveDimension(String queryName, String axisName, String dimensionName, int position) {
		OlapQuery query = queries.get(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		Axis newAxis = Axis.Standard.valueOf(axisName);
		System.out.println("move dimension to axis:" + newAxis.toString() + " dimension" + dimension.getName().toString());
		if(position==-1){
			query.moveDimension(dimension, newAxis);
		}
		else{
			query.moveDimension(dimension, newAxis, position);
		}
	}
	
	public void removeDimension(String queryName, String axisName, String dimensionName) {
		OlapQuery query = queries.get(queryName);
		String unusedName = query.getUnusedAxis().getName();
		moveDimension(queryName, unusedName , dimensionName, -1);
	}
	
	
	public List<String> getDimension(String queryName, String axis) {
		OlapQuery q = queries.get(queryName);
		Axis.Standard tmpAxis = null;
		
		if(!axis.equals("UNUSED")) {
			tmpAxis = Axis.Standard.valueOf(axis);
		}
		
		List<String> dimensions = new ArrayList<String>();

		if (tmpAxis != null) {
			QueryAxis qa = q.getAxis(Axis.Factory.forOrdinal(tmpAxis.axisOrdinal()));
			for (QueryDimension dim : qa.getDimensions()) {
				dimensions.add(dim.getName());
			}
		}
		else if (axis.equals("UNUSED")){
		    QueryAxis qa = q.getUnusedAxis();
            for (QueryDimension dim : qa.getDimensions()) {
                dimensions.add(dim.getName());
            }
		}
		return dimensions;
		
	}
	
	public List<SaikuHierarchy> getHierarchies(String queryName, String dimensionName) {
		OlapQuery q = queries.get(queryName);
		List<SaikuHierarchy> hierarchies = new ArrayList<SaikuHierarchy>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			hierarchies.addAll(ObjectUtil.convertHierarchies(dim.getDimension().getHierarchies()));
		}
		return hierarchies;
	}
	
	public List<SaikuLevel> getLevels(String queryName, String dimensionName, String hierarchyName) {
		OlapQuery q = queries.get(queryName);
		List<SaikuLevel> levels = new ArrayList<SaikuLevel>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			Hierarchy hierarchy = dim.getDimension().getHierarchies().get(hierarchyName);
			levels = ObjectUtil.convertLevels(hierarchy.getLevels());
		}
		return levels;
	}
	
	public List<SaikuMember> getLevelMembers(String queryName, String dimensionName, String hierarchyName, String levelName) {
		OlapQuery q = queries.get(queryName);
		List<SaikuMember> members = new ArrayList<SaikuMember>();
		QueryDimension dim = q.getDimension(dimensionName);
		if (dim != null) {
			Hierarchy hierarchy = dim.getDimension().getHierarchies().get(hierarchyName);
			Level level =  hierarchy.getLevels().get(levelName);
			try {
				members = ObjectUtil.convertMembers(level.getMembers());
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
			resetAxisSelections(qAxis);
			for (QueryDimension dim : qAxis.getDimensions()) {
				qAxis.removeDimension(dim);
			}
		}
	}
	public void clearAxisSelections(String queryName, String axisName) {
		OlapQuery query = queries.get(queryName);
		if (Axis.Standard.valueOf(axisName) != null) {
			QueryAxis qAxis = query.getAxis(Axis.Standard.valueOf(axisName));
			resetAxisSelections(qAxis);
		}
	}
			
	private void resetAxisSelections(QueryAxis axis) {
		for (QueryDimension dim : axis.getDimensions()) {
			dim.clearInclusions();
			dim.clearExclusions();
			dim.clearSort();
		}
	}
	
	private void clearAllQuerySelections(OlapQuery query) {
		resetAxisSelections(query.getUnusedAxis());
		Map<Axis,QueryAxis> axes = query.getAxes();
		for (Axis axis : axes.keySet()) {
			resetAxisSelections(axes.get(axis));
		}
	}

    public void pullup(String queryName, String axisName, String dimensionName, int position) {
        OlapQuery query = queries.get(queryName);
        QueryDimension dimension = query.getDimension(dimensionName);
        QueryAxis newAxis = dimension.getAxis();
        newAxis.pullUp(position);
        
    }
	
    public void pushdown(String queryName, String axisName, String dimensionName, int position) {
        OlapQuery query = queries.get(queryName);
        QueryDimension dimension = query.getDimension(dimensionName);
        QueryAxis newAxis = dimension.getAxis();
        newAxis.pushDown(position);
        
    }

    public void setNonEmpty(String queryName, String axisName, boolean bool) {
        OlapQuery query = queries.get(queryName);
        QueryAxis newAxis = query.getAxis(Axis.Standard.valueOf(axisName));
        newAxis.setNonEmpty(bool);
    }

    public void sortAxis(String queryName, String axisName, String sortOrder) {
        OlapQuery query = queries.get(queryName);
        QueryAxis newAxis = query.getAxis(Axis.Standard.valueOf(axisName));
        if(sortOrder.equals("CLEAR")){
           newAxis.clearSort();
        }else{
        SortOrder sort = SortOrder.valueOf(sortOrder);
        try {
            newAxis.sort(sort);
        } catch (OlapException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        }
        
    }

    public String getMDXQuery(String queryName) {
        return queries.get(queryName).getMDX();
    }
}

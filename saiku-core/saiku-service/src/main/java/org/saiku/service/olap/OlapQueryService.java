/*
 * Copyright (C) 2011 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.service.olap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.olap4j.Axis;
import org.olap4j.Axis.Standard;
import org.olap4j.OlapException;
import org.olap4j.mdx.IdentifierNode;
import org.olap4j.mdx.IdentifierSegment;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
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
import org.saiku.service.util.exception.SaikuServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OlapQueryService {

    private static final Logger log = LoggerFactory.getLogger(OlapQueryService.class);
    
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
		List<SaikuDimension> dimensions = new ArrayList<SaikuDimension>();
		QueryAxis qa;
		try {
			qa = q.getAxis(axis);
			dimensions.addAll(ObjectUtil.convertQueryDimensions(qa.getDimensions()));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return dimensions;

	}

	public boolean includeMember(String queryName, String dimensionName, String uniqueMemberName, String selectionType, int memberposition){
		OlapQuery query = queries.get(queryName);
		List<IdentifierSegment> memberList = IdentifierNode.parseIdentifier(uniqueMemberName).getSegmentList();
		QueryDimension dimension = query.getDimension(dimensionName);
		final Selection.Operator selectionMode = Selection.Operator.valueOf(selectionType);

		try {
			Selection sel = dimension.createSelection(selectionMode, memberList);
			if (dimension.getInclusions().contains(sel)) {
				dimension.getInclusions().remove(sel);
			}
			if (memberposition < 0) {
				memberposition = dimension.getInclusions().size();
			}
			dimension.getInclusions().add(memberposition, sel);
			return true;
		} catch (OlapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
	}

	public boolean removeMember(String queryName, String dimensionName, String uniqueMemberName, String selectionType) throws SaikuServiceException{
		OlapQuery query = queries.get(queryName);
		List<IdentifierSegment> memberList = IdentifierNode.parseIdentifier(uniqueMemberName).getSegmentList();
		QueryDimension dimension = query.getDimension(dimensionName);
		final Selection.Operator selectionMode = Selection.Operator.valueOf(selectionType);

		try {
			if (log.isDebugEnabled()) {
				log.debug("query: "+queryName+" remove:" + selectionMode.toString() + " " + memberList.size());
			}
			Selection selection = dimension.createSelection(selectionMode, memberList);
			dimension.getInclusions().remove(selection);
			if (dimension.getInclusions().size() == 0) {
				moveDimension(queryName, null, dimensionName, -1);
			}
			return true;
		} catch (OlapException e) {
			throw new SaikuServiceException("Error removing member (" + uniqueMemberName + ") of dimension (" +dimensionName+")",e);
		}
	}

	public boolean includeLevel(String queryName, String dimensionName, String uniqueHierarchyName, String uniqueLevelName) {
		OlapQuery query = queries.get(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		final Selection.Operator selectionMode = Selection.Operator.MEMBER;
		try {
			for (Hierarchy hierarchy : dimension.getDimension().getHierarchies()) {
				if (hierarchy.getUniqueName().equals(uniqueHierarchyName)) {
					for (Level level : hierarchy.getLevels()) {
						if (level.getUniqueName().equals(uniqueLevelName)) {
							for (Member member : level.getMembers()) {
								Selection sel = dimension.createSelection(selectionMode, member);
								if (!dimension.getInclusions().contains(sel)) {
									dimension.include(selectionMode, member);
								}
							}
						}
					}
				}
			}
			return true;
		} catch (OlapException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
	}

	public boolean removeLevel(String queryName, String dimensionName, String uniqueHierarchyName, String uniqueLevelName) {
		OlapQuery query = queries.get(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		final Selection.Operator selectionMode = Selection.Operator.MEMBER;
		try {
			for (Hierarchy hierarchy : dimension.getDimension().getHierarchies()) {		
				if (hierarchy.getUniqueName().equals(uniqueHierarchyName)) {
					for (Level level : hierarchy.getLevels()) {
						if (level.getUniqueName().equals(uniqueLevelName)) {
							for (Member member : level.getMembers()) {
								Selection inclusion = dimension.createSelection(selectionMode, member);
								dimension.getInclusions().remove(inclusion);
							}
							if (dimension.getInclusions().size() == 0) {
								moveDimension(queryName, null , dimensionName, -1);
							}

						}
					}
				}
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}
		return true;
	}


	public void moveDimension(String queryName, String axisName, String dimensionName, int position) {
		try {
			if (log.isDebugEnabled()) {
				log.debug("move query: " + queryName + " dimension " + dimensionName + " to axis " + axisName + "  position" + position);
			}
			OlapQuery query = queries.get(queryName);
			QueryDimension dimension = query.getDimension(dimensionName);
			Axis newAxis = axisName != null ? Axis.Standard.valueOf(axisName) : null;
			if(position==-1){
				query.moveDimension(dimension, newAxis);
			}
			else{
				query.moveDimension(dimension, newAxis, position);
			}
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void removeDimension(String queryName, String axisName, String dimensionName) {
		OlapQuery query = queries.get(queryName);
		String unusedName = query.getUnusedAxis().getName();
		moveDimension(queryName, unusedName , dimensionName, -1);
	}


	public List<String> getDimension(String queryName, String axis) throws SaikuServiceException {
		List<String> dimensions = new ArrayList<String>();
		OlapQuery q = queries.get(queryName);
		
		QueryAxis qa;
		try {
			qa = q.getAxis(axis);
			if (qa != null) {
				for (QueryDimension dim : qa.getDimensions()) {
					dimensions.add(dim.getName());
				}
			}
		} catch (Exception e) {
			throw new SaikuServiceException("Error getting dimensions for query ("+queryName +") axis ( "+axis+ " )",e);
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

	public void setProperties(String queryName, Properties props) {
		OlapQuery query = queries.get(queryName);
		query.setProperties(props);
	}	
	
	
	public Properties getProperties(String queryName) {
		OlapQuery query = queries.get(queryName);
		return query.getProperties();
	}
	
	
	public String getMDXQuery(String queryName) {
		return queries.get(queryName).getMdx();
	}
}

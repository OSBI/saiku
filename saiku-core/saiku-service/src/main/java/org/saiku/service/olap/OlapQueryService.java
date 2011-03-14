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

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.olap4j.Axis;
import org.olap4j.CellSet;
import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.olap4j.OlapStatement;
import org.olap4j.mdx.IdentifierNode;
import org.olap4j.mdx.IdentifierSegment;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.olap4j.query.Selection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimensionSelection;
import org.saiku.olap.dto.SaikuQuery;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query.OlapQuery;
import org.saiku.olap.query.QueryDeserializer;
import org.saiku.olap.util.ObjectUtil;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.olap.util.formatter.CellSetFormatter;
import org.saiku.olap.util.formatter.HierarchicalCellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.service.util.OlapUtil;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.service.util.export.CsvExporter;
import org.saiku.service.util.export.ExcelExporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OlapQueryService {

    private static final Logger log = LoggerFactory.getLogger(OlapQueryService.class);
    
	private OlapDiscoverService olapDiscoverService;

	private Map<String,OlapQuery> queries = new HashMap<String,OlapQuery>();

	public void setOlapDiscoverService(OlapDiscoverService os) {
		olapDiscoverService = os;
	}

	public SaikuQuery createNewOlapQuery(String queryName, SaikuCube cube) {
		try {
			Cube cub = olapDiscoverService.getNativeCube(cube);
			if (cub != null) {
				OlapQuery query = new OlapQuery(new Query(queryName, cub),cube);
				queries.put(queryName, query);
				return ObjectUtil.convert(query);
			}
		} catch (Exception e) {
			log.error("Cannot create new query for cube :" + cube,e);
		}
		return null;

	}

	public SaikuQuery createNewOlapQuery(String name, String xml) {
		try {
			SaikuCube scube = QueryDeserializer.getFakeCube(xml);
			OlapConnection con = olapDiscoverService.getNativeConnection(scube.getConnectionName());
			OlapQuery query = QueryDeserializer.unparse(xml, con);
			if (name == null) {
				queries.put(query.getName(), query);
			}
			else {
				queries.put(name, query);
			}
			return ObjectUtil.convert(query);
		} catch (Exception e) {
			throw new SaikuServiceException("Error creating query from xml",e);
		}
	}


	public void closeQuery(String queryName) {
		queries.remove(queryName);
		OlapUtil.deleteCellSet(queryName);
	}

	public List<String> getQueries() {
		List<String> queryList = new ArrayList<String>();
		queryList.addAll(queries.keySet());
		return queryList;
	}
	
	public SaikuQuery getQuery(String queryName) {
		OlapQuery q = getOlapQuery(queryName);
		return ObjectUtil.convert(q);
	}

	public void deleteQuery(String queryName) {
		queries.remove(queryName);
	}

	public CellDataSet execute(String queryName) {
		return execute(queryName,new HierarchicalCellSetFormatter());
	}

	public CellDataSet execute(String queryName, String formatter) {
		formatter = formatter == null ? "" : formatter.toLowerCase(); 
			if(formatter.equals("flat")) {
				return execute(queryName, new CellSetFormatter());
			}
			else if (formatter.equals("hierarchical")) {
				return execute(queryName, new HierarchicalCellSetFormatter());
			}
			return execute(queryName, new HierarchicalCellSetFormatter());
	}
	
	public CellDataSet execute(String queryName, ICellSetFormatter formatter) {
		OlapQuery query = getOlapQuery(queryName);
		try {
			Long start = (new Date()).getTime();
			CellSet cellSet =  query.execute();
	        Long exec = (new Date()).getTime();
	        CellDataSet result = OlapResultSetUtil.cellSet2Matrix(cellSet,formatter);
	        Long format = (new Date()).getTime();
	        log.info("Size: " + result.getWidth() + "/" + result.getHeight() + "\tExecute:\t" + (exec - start)
	                + "ms\tFormat:\t" + (format - exec) + "ms\t Total: " + (format - start) + "ms");

			OlapUtil.storeCellSet(queryName, cellSet);
			return result;
		} catch (Exception e) {
			throw new SaikuServiceException("Can't execute query: " + queryName,e);
		}
	}
	
	public ResultSet drilldown(String queryName, int maxrows) {
		try {
			final OlapConnection con = olapDiscoverService.getNativeConnection(getQuery(queryName).getCube().getConnectionName()); 
			final OlapStatement stmt = con.createStatement();
			String mdx = getMDXQuery(queryName);
			if (maxrows > 0) {
				mdx = "DRILLTHROUGH MAXROWS " + maxrows + " " + mdx;
			}
			else {
				mdx = "DRILLTHROUGH " + mdx;
			}
			return  stmt.executeQuery(mdx);
		} catch (SQLException e) {
			throw new SaikuServiceException("Error DRILLTHROUGH: " + queryName,e);
		}
	}
	
	public void swapAxes(String queryName) {
		getOlapQuery(queryName).swapAxes();
	}

	public boolean includeMember(String queryName, String dimensionName, String uniqueMemberName, String selectionType, int memberposition){
		OlapQuery query = getOlapQuery(queryName);
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
			throw new SaikuServiceException("Cannot include member query ("+queryName+") dimension (" + dimensionName + ") member ("+
					uniqueMemberName+") operator (" + selectionType + ") position " + memberposition,e);
		}
	}

	public boolean removeMember(String queryName, String dimensionName, String uniqueMemberName, String selectionType) throws SaikuServiceException{
		OlapQuery query = getOlapQuery(queryName);
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
		OlapQuery query = getOlapQuery(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		for (Hierarchy hierarchy : dimension.getDimension().getHierarchies()) {
			if (hierarchy.getUniqueName().equals(uniqueHierarchyName)) {
				for (Level level : hierarchy.getLevels()) {
					if (level.getUniqueName().equals(uniqueLevelName)) {
							Selection sel = dimension.createSelection(level);
							if (!dimension.getInclusions().contains(sel)) {
								dimension.include(level);
							}
							return true;
					}
				}
			}
		}
		return false;
	}

	public boolean removeLevel(String queryName, String dimensionName, String uniqueHierarchyName, String uniqueLevelName) {
		OlapQuery query = getOlapQuery(queryName);
		QueryDimension dimension = query.getDimension(dimensionName);
		try {
			for (Hierarchy hierarchy : dimension.getDimension().getHierarchies()) {		
				if (hierarchy.getUniqueName().equals(uniqueHierarchyName)) {
					for (Level level : hierarchy.getLevels()) {
						if (level.getUniqueName().equals(uniqueLevelName)) {
							Selection inclusion = dimension.createSelection(level);
							dimension.getInclusions().remove(inclusion);
							
							if (dimension.getInclusions().size() == 0) {
								moveDimension(queryName, null , dimensionName, -1);
							}

						}
					}
				}
			}
		} catch (Exception e) {
			throw new SaikuServiceException("Cannot remove level" + uniqueLevelName + "from dimension " + dimensionName,e);
		}
		return true;
	}


	public void moveDimension(String queryName, String axisName, String dimensionName, int position) {
		try {
			if (log.isDebugEnabled()) {
				log.debug("move query: " + queryName + " dimension " + dimensionName + " to axis " + axisName + "  position" + position);
			}
			OlapQuery query = getOlapQuery(queryName);
			QueryDimension dimension = query.getDimension(dimensionName);
			Axis newAxis = axisName != null ? ( "UNUSED".equals(axisName) ? null : Axis.Standard.valueOf(axisName)) : null;
			if(position==-1){
				query.moveDimension(dimension, newAxis);
			}
			else{
				query.moveDimension(dimension, newAxis, position);
			}
		}
		catch (Exception e) {
			throw new SaikuServiceException("Cannot move dimension:" + dimensionName + " to axis: "+axisName,e);
		}
	}

	public void removeDimension(String queryName, String axisName, String dimensionName) {
		OlapQuery query = getOlapQuery(queryName);
		String unusedName = query.getUnusedAxis().getName();
		moveDimension(queryName, unusedName , dimensionName, -1);
	}
	
	public List<SaikuDimensionSelection> getAxisSelection(String queryName, String axis) {
		OlapQuery query = getOlapQuery(queryName);

		List<SaikuDimensionSelection> dimsel = new ArrayList<SaikuDimensionSelection>();
		try {
			QueryAxis qaxis = query.getAxis(axis);
			if (qaxis != null) {
				for (QueryDimension dim : qaxis.getDimensions()) {
					dimsel.add(ObjectUtil.converDimensionSelection(dim));
				}
			}
		} catch (SaikuOlapException e) {
			throw new SaikuServiceException("Cannot get dimension selections",e);
		}
		return dimsel;
	}
	
	public SaikuDimensionSelection getAxisDimensionSelections(String queryName, String axis, String dimension) {
		OlapQuery query = getOlapQuery(queryName);
		try {
			QueryAxis qaxis = query.getAxis(axis);
			if (qaxis != null) {
				QueryDimension dim = query.getDimension(dimension);
				if (dim != null) {
					return ObjectUtil.converDimensionSelection(dim);
				}
				else
				{
					throw new SaikuOlapException("Cannot find dimension with name:" + dimension);
				}
			}
			else {
				throw new SaikuOlapException("Cannot find axis with name:" + axis);
			}
		} catch (SaikuOlapException e) {
			throw new SaikuServiceException("Cannot get dimension selections",e);
		}
	}

	public void clearQuery(String queryName) {
		OlapQuery query = getOlapQuery(queryName);
		query.clearAllQuerySelections();
	}

	public void clearAxis(String queryName, String axisName) {
		OlapQuery query = getOlapQuery(queryName);
		if (Axis.Standard.valueOf(axisName) != null) {
			QueryAxis qAxis = query.getAxis(Axis.Standard.valueOf(axisName));
			query.resetAxisSelections(qAxis);
			for (QueryDimension dim : qAxis.getDimensions()) {
				qAxis.removeDimension(dim);
			}
		}
	}

	public void clearAxisSelections(String queryName, String axisName) {
		OlapQuery query = getOlapQuery(queryName);
		if (Axis.Standard.valueOf(axisName) != null) {
			QueryAxis qAxis = query.getAxis(Axis.Standard.valueOf(axisName));
			query.resetAxisSelections(qAxis);
		}
	}
	
	public void resetQuery(String queryName) {
		OlapQuery query = getOlapQuery(queryName);
		query.resetQuery();
	}

	public void setNonEmpty(String queryName, String axisName, boolean bool) {
		OlapQuery query = getOlapQuery(queryName);
		QueryAxis newAxis = query.getAxis(Axis.Standard.valueOf(axisName));
		newAxis.setNonEmpty(bool);
	}

	public void setProperties(String queryName, Properties props) {
		OlapQuery query = getOlapQuery(queryName);
		query.setProperties(props);
	}	
	
	
	public Properties getProperties(String queryName) {
		OlapQuery query = getOlapQuery(queryName);
		return query.getProperties();
	}

	public String getMDXQuery(String queryName) {
		return getOlapQuery(queryName).getMdx();
	}
	
	public String getQueryXml(String queryName) {
		OlapQuery query = getOlapQuery(queryName);
		return query.toXml();
	}

	public byte[] getExport(String queryName, String type) {
		return getExport(queryName,type,new HierarchicalCellSetFormatter());
	}

	public byte[] getExport(String queryName, String type, String formatter) {
		formatter = formatter == null ? "" : formatter.toLowerCase();
			if (formatter.equals("flat")) {
				return getExport(queryName, type, new CellSetFormatter());
			} else if (formatter.equals("hierarchical")) {
				return getExport(queryName, type, new HierarchicalCellSetFormatter());
			}
			
			return getExport(queryName, type, new HierarchicalCellSetFormatter());
	}
	
	public byte[] getExport(String queryName, String type, ICellSetFormatter formatter) {
		if (type != null) {
			CellSet rs = OlapUtil.getCellSet(queryName);
			if (type.toLowerCase().equals("xls")) {
				return ExcelExporter.exportExcel(rs,formatter);	
			}
			if (type.toLowerCase().equals("csv")) {
				return CsvExporter.exportCsv(rs,",","\"", formatter);	
			}
		}
		return new byte[0];
	}
	
	
	private OlapQuery getOlapQuery(String queryName) {
		OlapQuery query = queries.get(queryName);
		if (query == null) {
			throw new SaikuServiceException("No query with name ("+queryName+") found");
		}
		return query;
	}
}

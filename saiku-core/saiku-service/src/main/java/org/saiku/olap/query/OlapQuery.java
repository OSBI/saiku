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
package org.saiku.olap.query;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Properties;

import mondrian.rolap.RolapConnection;

import org.apache.commons.lang.StringUtils;
import org.olap4j.Axis;
import org.olap4j.Axis.Standard;
import org.olap4j.CellSet;
import org.olap4j.OlapConnection;
import org.olap4j.OlapStatement;
import org.olap4j.Scenario;
import org.olap4j.impl.IdentifierParser;
import org.olap4j.mdx.ParseTreeWriter;
import org.olap4j.metadata.Catalog;
import org.olap4j.metadata.Cube;
import org.olap4j.query.LimitFunction;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.olap4j.query.QueryDimension.HierarchizeMode;
import org.olap4j.query.Selection;
import org.olap4j.query.SortOrder;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuTag;
import org.saiku.olap.query.QueryProperties.QueryProperty;
import org.saiku.olap.query.QueryProperties.QueryPropertyFactory;
import org.saiku.olap.util.SaikuProperties;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OlapQuery implements IQuery {

    private static final Logger log = LoggerFactory.getLogger(OlapQuery.class);

    private static final String SCENARIO = "Scenario";

	private Query query;
	private Properties properties = new Properties();

	private SaikuCube cube;
	
	private Scenario scenario;
	
	private SaikuTag tag = null;
	
	private CellSet cellset = null;

	private OlapStatement statement = null;

	private OlapConnection connection;
	
	public OlapQuery(Query query, OlapConnection connection, SaikuCube cube, boolean applyDefaultProperties) {
		this.query = query;
		this.cube = cube;
		this.connection = connection;
		if (applyDefaultProperties) {
			applyDefaultProperties();	
		}
	}

	public OlapQuery(Query query, OlapConnection connection, SaikuCube cube) {
		this(query,connection, cube,true);
	}
	
	public void swapAxes() {
		this.query.swapAxes();


		QueryAxis rows = query.getAxis(Axis.ROWS);
		QueryAxis cols = query.getAxis(Axis.COLUMNS);
		
		// 3-way swap
		String colFilter = cols.getFilterCondition();
		LimitFunction colLimit = cols.getLimitFunction();
		BigDecimal colN = cols.getLimitFunctionN();
		String colLimitSort = cols.getLimitFunctionSortLiteral();
		SortOrder colSort = cols.getSortOrder();
		String colSortIdentifier = cols.getSortIdentifierNodeName();

		cols.clearFilter();
		cols.clearLimitFunction();
		cols.clearSort();
		
		// columns
		if (rows.getSortOrder() != null) {
			cols.sort(rows.getSortOrder(), rows.getSortIdentifierNodeName());
		}
		if (rows.getLimitFunction() != null) {
			cols.limit(rows.getLimitFunction(), rows.getLimitFunctionN(), rows.getLimitFunctionSortLiteral());
		}
		if (StringUtils.isNotBlank(rows.getFilterCondition())) {
			cols.filter(rows.getFilterCondition());
		}
		
		rows.clearFilter();
		rows.clearLimitFunction();
		rows.clearSort();
		
		// rows
		if (colSort != null) {
			rows.sort(colSort, colSortIdentifier);
		}
		if (colLimit != null) {
			rows.limit(colLimit, colN, colLimitSort);
		}
		if (StringUtils.isNotBlank(colFilter)) {
			rows.filter(colFilter);
		}
		

	}
	
	public Map<Axis, QueryAxis> getAxes() {
		return this.query.getAxes();
	}
	
	public QueryAxis getAxis(Axis axis) {
		return this.query.getAxis(axis);
	}
	
	public QueryAxis getAxis(String name) throws SaikuOlapException {
		if ("UNUSED".equals(name)) {
			return getUnusedAxis();
		}
		Standard standardAxis = Standard.valueOf(name);
		if (standardAxis == null)
			throw new SaikuOlapException("Axis ("+name+") not found for query ("+ query.getName() + ")");
		
		Axis queryAxis = Axis.Factory.forOrdinal(standardAxis.axisOrdinal());
		return query.getAxis(queryAxis);
	}
	
	public Cube getCube() {
		return this.query.getCube();
	}
	
	public QueryAxis getUnusedAxis() {
		return this.query.getUnusedAxis();
	}
	
	public void moveDimension(QueryDimension dimension, Axis axis) {
		moveDimension(dimension, axis, -1);
	}

	public void moveDimension(QueryDimension dimension, Axis axis, int position) {
        QueryAxis oldQueryAxis = findAxis(dimension);
        QueryAxis newQueryAxis = query.getAxis(axis);
		if (dimension.getName() != "Measures" && !Axis.FILTER.equals(axis)) {
			dimension.setHierarchyConsistent(true);
			dimension.setHierarchizeMode(HierarchizeMode.PRE);
		} else {
			dimension.setHierarchyConsistent(false);
			dimension.clearHierarchizeMode();
		}
		
		if (oldQueryAxis != null && newQueryAxis != null && (oldQueryAxis.getLocation() != newQueryAxis.getLocation()) && oldQueryAxis.getLocation() != null) 
		{
			for (QueryAxis qAxis : query.getAxes().values()) {
				if (qAxis.getSortOrder() != null && qAxis.getSortIdentifierNodeName() != null) {
					String sortLiteral = qAxis.getSortIdentifierNodeName();
					if (sortLiteral.startsWith(dimension.getDimension().getUniqueName()) || sortLiteral.startsWith("[" + dimension.getName())) {
						qAxis.clearSort();
						// System.out.println("Removed Sort: " + qAxis.getLocation() + " - "+ sortLiteral);
					}
				}
			}
		}

        if (oldQueryAxis != null && newQueryAxis != null && (position > -1 || (oldQueryAxis.getLocation() != newQueryAxis.getLocation()))) {
            oldQueryAxis.removeDimension(dimension);
            if (position > -1) {
            	newQueryAxis.addDimension(position, dimension);
            } else {
            	newQueryAxis.addDimension(dimension);
            }
        }
    }
	
	public QueryDimension getDimension(String name) {
		return this.query.getDimension(name);
	}
	
	private QueryAxis findAxis(QueryDimension dimension) {
		if (query.getUnusedAxis().getDimensions().contains(dimension)) {
			return query.getUnusedAxis();
		}
		else {
			Map<Axis,QueryAxis> axes = query.getAxes();
			for (Axis axis : axes.keySet()) {
				if (axes.get(axis).getDimensions().contains(dimension)) {
					return axes.get(axis);
				}
			}
		
		}
		return null;
	}

    public String getMdx() {
        final Writer writer = new StringWriter();
        this.query.getSelect().unparse(new ParseTreeWriter(new PrintWriter(writer)));
        return writer.toString();
    }
    
    public SaikuCube getSaikuCube() {
    	return cube;
    }
    
    public String getName() {
    	return query.getName();
    }

    public CellSet execute() throws Exception {

    	if (scenario != null && query.getDimension(SCENARIO) != null) {
    		QueryDimension dimension = query.getDimension(SCENARIO);
    		moveDimension(dimension, Axis.FILTER);
    		Selection sel = dimension.createSelection(IdentifierParser.parseIdentifier("[Scenario].[" + getScenario().getId() + "]"));
    		if (!dimension.getInclusions().contains(sel)) {
    			dimension.getInclusions().add(sel);
    		}
    	}
    	
        String mdx = getMdx();
        
        log.debug("Executing query (" + this.getName() + ") :\n" + mdx);
        
        final Catalog catalog = query.getCube().getSchema().getCatalog();
        this.connection.setCatalog(catalog.getName());
		OlapStatement stmt = connection.createStatement();
		this.statement = stmt;
		CellSet cellSet = stmt.executeOlapQuery(mdx);
		if (this.statement != null) {
			this.statement.close();
		}
		this.statement = null;
    	if (scenario != null && query.getDimension(SCENARIO) != null) {
    		QueryDimension dimension = query.getDimension(SCENARIO);
    		dimension.getInclusions().clear();
    		moveDimension(dimension, null);
    	}

        return cellSet;
    }
    
    private void applyDefaultProperties() {
    	if (SaikuProperties.olapDefaultNonEmpty) {
    		query.getAxis(Axis.ROWS).setNonEmpty(true);
    		query.getAxis(Axis.COLUMNS).setNonEmpty(true);
    	}
    }
    
	public void resetAxisSelections(QueryAxis axis) {
		for (QueryDimension dim : axis.getDimensions()) {
			dim.clearInclusions();
			dim.clearExclusions();
			dim.clearSort();
		}
		try {
			axis.clearFilter();
			axis.clearLimitFunction();
			axis.clearSort();
		} catch (NoSuchMethodError e) {}
			
	}

	public void clearAllQuerySelections() {
		resetAxisSelections(getUnusedAxis());
		Map<Axis,QueryAxis> axes = getAxes();
		for (Axis axis : axes.keySet()) {
			resetAxisSelections(axes.get(axis));
		}
	}
	
	public void resetQuery() {
		clearAllQuerySelections();
		Map<Axis,QueryAxis> axes = getAxes();
		for (Axis axis : axes.keySet()) {
			QueryAxis qAxis = axes.get(axis);
			for (int i = 0; i < qAxis.getDimensions().size(); i++ ) {
				QueryDimension qDim = qAxis.getDimensions().get(0);
				moveDimension(qDim, null);
			}
		}
	}
	
	public void clearAxis(String axisName) throws SaikuOlapException {
		if (StringUtils.isNotBlank(axisName)) {
			QueryAxis qAxis = getAxis(axisName);
			resetAxisSelections(qAxis);
			for (int i = 0; i < qAxis.getDimensions().size(); i++ ) {
				QueryDimension qDim = qAxis.getDimensions().get(0);
				moveDimension(qDim, null);
			}
		}
	}
    
	public void setProperties(Properties props) {
		if (props != null) {
			this.properties.putAll(props);
			for (Object _key : props.keySet()) {
				String key = (String) _key;
				String value = props.getProperty((String) key);
				QueryProperty prop = QueryPropertyFactory.getProperty(key, value, this);
				prop.handle();
			}
		}
	}
    
    public Properties getProperties() {
    	this.properties.putAll(QueryPropertyFactory.forQuery(this));
		try {
			
			connection.createScenario();
			if (query.getDimension("Scenario") != null) {
				this.properties.put("org.saiku.connection.scenario", Boolean.toString(true));
			}
			else {
				this.properties.put("org.saiku.connection.scenario", Boolean.toString(false));
			}
			this.properties.put("org.saiku.query.explain", Boolean.toString(connection.isWrapperFor(RolapConnection.class)));
		} catch (Exception e) {
			this.properties.put("org.saiku.connection.scenario", Boolean.toString(false));
			this.properties.put("org.saiku.query.explain", Boolean.toString(false));
		}
    	return this.properties;
    }
    
    public String toXml() {
    	QuerySerializer qs = new QuerySerializer(this);
    	return qs.createXML();
    }
    
    public Boolean isDrillThroughEnabled() {
    	return query.getCube().isDrillThroughEnabled();
    }

	public QueryType getType() {
		return QueryType.QM;
	}
	
	public void setMdx(String mdx) {
		throw new UnsupportedOperationException();
	}
	
	public void setScenario(Scenario scenario) {
		this.scenario = scenario;
	}
	
	public Scenario getScenario() {
		return scenario;
	}

	public void setTag(SaikuTag tag) {
		this.tag = tag;
	}

	public SaikuTag getTag() {
		return this.tag;
	}

	public void removeTag() {
		tag = null;		
	}

	public void storeCellset(CellSet cs) {
		this.cellset = cs;
		
	}

	public CellSet getCellset() {
		return cellset;
	}

	public void setStatement(OlapStatement os) {
		this.statement = os;
		
	}

	public OlapStatement getStatement() {
		return this.statement;
	}

	public void cancel() throws Exception {
		if (this.statement != null && !this.statement.isClosed()) {
			statement.cancel();
			statement.close();
		}
		this.statement = null;
	}

}

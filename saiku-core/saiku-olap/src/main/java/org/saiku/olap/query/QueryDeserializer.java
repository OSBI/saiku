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

package org.saiku.olap.query;

import java.io.ByteArrayInputStream;
import java.sql.SQLException;
import java.util.Iterator;

import org.apache.commons.lang.StringUtils;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;
import org.olap4j.Axis;
import org.olap4j.OlapConnection;
import org.olap4j.OlapException;
import org.olap4j.mdx.IdentifierNode;
import org.olap4j.metadata.Catalog;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.NamedList;
import org.olap4j.metadata.Schema;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.olap4j.query.QueryDimension.HierarchizeMode;
import org.olap4j.query.Selection;
import org.olap4j.query.SortOrder;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.util.exception.QueryParseException;
import org.xml.sax.InputSource;



/**
 * De-Serializes an XML into a PatQuery object
 * @created May 27, 2010 
 * @since 0.8
 * @author Paul Stoellberger
 * 
 */
public class QueryDeserializer {


    private static Document dom;
    private static Query qm;
    private static String xml;
    private static OlapConnection connection;
    private static InputSource source;

    public static OlapQuery unparse(String xml, OlapConnection connection) throws Exception {
        QueryDeserializer.connection = connection;
        QueryDeserializer.xml = xml;
        SAXBuilder parser = new SAXBuilder();
        source = new InputSource((new ByteArrayInputStream(QueryDeserializer.xml.getBytes())));
        dom = parser.build(source);
        Element child =(Element) dom.getRootElement();
        Element qmElement = child.getChild("QueryModel");
        OlapQuery returnQuery = null;
        if (qmElement != null) {
            returnQuery = createQmQuery();
            return returnQuery;
        }
        throw new Exception("Cant find <QueryModel> nor <MDX> Query");
    }
    
    public static SaikuCube getFakeCube(String xml) throws Exception {
        QueryDeserializer.xml = xml;
        SAXBuilder parser = new SAXBuilder();
        source = new InputSource((new ByteArrayInputStream(QueryDeserializer.xml.getBytes())));
        dom = parser.build(source);

        Element queryElement = dom.getRootElement();
        if (queryElement != null && queryElement.getName().equals("Query")) {

        	String cubeName = queryElement.getAttributeValue("cube");

        	if (!StringUtils.isNotBlank(cubeName)) {
        		throw new QueryParseException("Cube for query not defined");
        	}
        	String connectionName = queryElement.getAttributeValue("connection");
        	String catalogName = queryElement.getAttributeValue("catalog");
        	String schemaName = queryElement.getAttributeValue("schema");
        	return new SaikuCube(connectionName,cubeName,cubeName,catalogName,schemaName);
        }
        throw new Exception("Cant find <QueryModel> nor <MDX> Query");
    }
    
    public static SaikuCube getCube(String xml, OlapConnection con) throws Exception {
    	connection = con;
        QueryDeserializer.xml = xml;
        SAXBuilder parser = new SAXBuilder();
        source = new InputSource((new ByteArrayInputStream(QueryDeserializer.xml.getBytes())));
        dom = parser.build(source);

        Element queryElement = dom.getRootElement();
        if (queryElement != null && queryElement.getName().equals("Query")) {

        	String cubeName = queryElement.getAttributeValue("cube");

        	if (!StringUtils.isNotBlank(cubeName)) {
        		throw new QueryParseException("Cube for query not defined");
        	}
        	String connectionName = queryElement.getAttributeValue("connection");
        	String catalogName = queryElement.getAttributeValue("catalog");
        	String schemaName = queryElement.getAttributeValue("schema");
            Query tmpQuery = createEmptyQuery("tmp-1234",catalogName, schemaName, cubeName);
            Cube cub = tmpQuery.getCube();
        	return new SaikuCube(connectionName,cub.getUniqueName(), cub.getName(),catalogName,schemaName);
        }
        throw new Exception("Cant find <QueryModel> nor <MDX> Query");
    }

    private static OlapQuery createQmQuery() throws QueryParseException, SQLException {

        Element queryElement = dom.getRootElement();
        if (queryElement != null && queryElement.getName().equals("Query")) {

            String queryName = queryElement.getAttributeValue("name");
            String cubeName = queryElement.getAttributeValue("cube");

            if (!StringUtils.isNotBlank(cubeName)) {
                throw new QueryParseException("Cube for query not defined");
            }
            String connectionName = queryElement.getAttributeValue("connection");
            String catalogName = queryElement.getAttributeValue("catalog");
            String schemaName = queryElement.getAttributeValue("schema");

            try {
                Element qmElement = queryElement.getChild("QueryModel");
                if (qmElement != null) {
                    qm = createEmptyQuery(queryName,catalogName, schemaName, cubeName);
                    manipulateQuery(qmElement);
                    SaikuCube cube = new SaikuCube(connectionName,cubeName, qm.getCube().getName(),catalogName,schemaName);
                    return new OlapQuery(qm,cube);
                }
                else
                    throw new OlapException("Can't find child <QueryModel>");

            } catch (OlapException e) {
                throw new QueryParseException(e.getMessage(),e);
            }


        }
        else {
            throw new QueryParseException("Cannot parse Query Model: Query node not found and/or more than 1 Query node found");
        }


    }

    private static void manipulateQuery(Element qmElement) throws OlapException {
        moveDims2Axis(qmElement);


    }

    private static void moveDims2Axis(Element qmElement) throws OlapException {
        Element axesElement = qmElement.getChild("Axes");
        if (axesElement != null) {

            for(int i = 0; i < axesElement.getChildren("Axis").size(); i++) {
                Element axisElement = (Element) axesElement.getChildren("Axis").get(i);

                String location = axisElement.getAttributeValue("location");
                if (!StringUtils.isNotBlank(location)) {
                    throw new OlapException("Location for Axis Element can't be null");
                }

                QueryAxis qAxis = qm.getAxes().get(getAxisName(location));

                String nonEmpty = axisElement.getAttributeValue("nonEmpty");
                if (StringUtils.isNotBlank(nonEmpty)) {
                    qAxis.setNonEmpty(Boolean.parseBoolean(nonEmpty));
                }

                String sortOrder = axisElement.getAttributeValue("sortOrder");
                String sortEvaluationLiteral = axisElement.getAttributeValue("sortEvaluationLiteral");

                if (StringUtils.isNotBlank(sortOrder)) {
                    if (StringUtils.isNotBlank(sortEvaluationLiteral)) {
                        qAxis.sort(SortOrder.valueOf(sortOrder),sortEvaluationLiteral);
                    }
                    else {
                        qAxis.sort(SortOrder.valueOf(sortOrder));
                    }
                }

                Element dimensions = axisElement.getChild("Dimensions");
                if (dimensions != null) {
                    for(int z = 0; z < dimensions.getChildren("Dimension").size(); z++) {
                        Element dimensionElement = (Element) dimensions.getChildren("Dimension").get(z);
                        processDimension(dimensionElement, location);

                    }
                }
            }
        }

    }

    private static void processDimension(Element dimension, String location) throws OlapException {

        String dimName = dimension.getAttributeValue("name");
        if (StringUtils.isNotBlank(dimName)) {

            QueryDimension dim = qm.getDimension(dimName);

            if (dim == null)
                throw new OlapException("Dimension not found:" + dimName);

            String sortOrder = dimension.getAttributeValue("sortOrder");
            if (StringUtils.isNotBlank(sortOrder)) {
                dim.sort(SortOrder.valueOf(sortOrder));
            }

            String hierarchizeMode = dimension.getAttributeValue("hierarchizeMode");
            if (StringUtils.isNotBlank(hierarchizeMode)) {
                dim.setHierarchizeMode(HierarchizeMode.valueOf(hierarchizeMode));
            }

            qm.getAxes().get(Axis.Standard.valueOf(location)).getDimensions().add(dim);
            
            Element inclusions = dimension.getChild("Inclusions");
            if (inclusions != null) {
                for(int z = 0; z < inclusions.getChildren("Selection").size(); z++) {
                    Element selectionElement = (Element) inclusions.getChildren("Selection").get(z);
                    String name = selectionElement.getAttributeValue("node");
                    String operator = selectionElement.getAttributeValue("operator");
                    String type = selectionElement.getAttributeValue("type");
                    Selection sel = null;
                    if ("level".equals(type)) {
                    for (Hierarchy hierarchy : dim.getDimension().getHierarchies()) {
            				for (Level level : hierarchy.getLevels()) {
            					if (level.getUniqueName().equals(name)) {
            							 sel = dim.createSelection(level);
            					}
            				}
            			}
                    } else if ("member".equals(type)) {
                    	sel = dim.include(Selection.Operator.valueOf(operator), IdentifierNode.parseIdentifier(name).getSegmentList());	
                    }

                    

                    Element contextElement = selectionElement.getChild("Context");
                    if (sel != null && contextElement != null) {
                        for(int h = 0; h < contextElement.getChildren("Selection").size(); h++) {
                            Element context = (Element) contextElement.getChildren("Selection").get(h);
                            String contextname = context.getAttributeValue("node");
                            String contextoperator = context.getAttributeValue("operator");
                            String contextDimension = context.getAttributeValue("dimension");
                            QueryDimension contextDim = qm.getDimension(contextDimension);
                            if ( contextDim != null ) {
                                Selection contextSelection = contextDim.createSelection(Selection.Operator.valueOf(contextoperator), 
                                		IdentifierNode.parseIdentifier(contextname).getSegmentList());
                                if (contextSelection != null ) {
                                    sel.addContext(contextSelection);
                                }
                                else
                                    throw new OlapException("Cannot create selection for node: " + contextname + " operator:" + contextoperator + " on dimension: " + dim.getName());
                            }
                            else 
                                throw new OlapException("Cannot find dimension with name:" + contextDim);
                        }
                        
                    }

                }
            }
            
            Element exclusions = dimension.getChild("Exclusions");
            if (inclusions != null) {
                for(int z = 0; z < exclusions.getChildren("Selection").size(); z++) {
                    Element selectionElement = (Element) exclusions.getChildren("Selection").get(z);
                    String name = selectionElement.getAttributeValue("node");
                    String operator = selectionElement.getAttributeValue("operator");
                    dim.exclude(Selection.Operator.valueOf(operator), IdentifierNode.parseIdentifier(name).getSegmentList());
                    // ADD CONTEXT ?
                }
            }

        }
        else 
            throw new OlapException("No Dimension name defined");


    }

    private static Query createEmptyQuery(String queryName, String catalogName, String schemaName, String cubeName) throws SQLException {
        if (!StringUtils.isNotBlank(catalogName)) {
            try {
                connection.setCatalog(catalogName);
            } catch (SQLException e) {
                throw new OlapException(e.getMessage(),e);
            }
        }

        Cube cube = null;
        final NamedList<Catalog> catalogs = connection.getMetaData().getConnection().getOlapCatalogs();
        for (int k = 0; k < catalogs.size(); k++) {
        	final NamedList<Schema> schemas = catalogs.get(k).getSchemas();
        	Schema schema = schemas.get(schemaName);
        	final NamedList<Cube> cubes = schema.getCubes();
        	final Iterator<Cube> iter = cubes.iterator();
        	while (iter.hasNext() && cube == null) {
        		final Cube testCube = iter.next();
        		if (testCube.getUniqueName().equals(cubeName)) {
        			cube = testCube;
        		}
        	}
        }
        if (cube != null) {
            try {
                Query q = new Query(queryName,cube);
                return q;
            } catch (SQLException e) {
                throw new OlapException("Error creating query :" + queryName,e);
            }
        }
        else
            throw new OlapException("No Cube with name: " + cubeName + " found");

    }

    public static Axis.Standard getAxisName(String location) {
        if(location != null) {
            return org.olap4j.Axis.Standard.valueOf(location);
        }
        return null;

    }


}

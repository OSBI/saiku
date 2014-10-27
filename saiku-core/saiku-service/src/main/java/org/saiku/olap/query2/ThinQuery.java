/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.olap.query2;

import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.util.ServiceUtil;
import org.saiku.service.util.ISaikuQuery;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ThinQuery.
 */
public class ThinQuery implements ISaikuQuery {

  @Nullable
  private ThinQueryModel queryModel;
  private SaikuCube cube;
  private String mdx;
  private String name;
  private Map<String, String> parameters = new HashMap<String, String>();
  private Map<String, String> plugins = new HashMap<String, String>();
  private Map<String, Object> properties = new HashMap<String, Object>();
  private Map<String, String> metadata = new HashMap<String, String>();

  private String queryType = "OLAP";

  /**
   * Query Type.
   */
  public enum Type {
    MDX,
    QUERYMODEL
  }

  private Type type;

  public ThinQuery() {
  }

  public ThinQuery(String name, SaikuCube cube) {
    this(name, cube, new ThinQueryModel());
  }

  private ThinQuery(String name, SaikuCube cube, ThinQueryModel queryModel) {
    super();
    this.queryModel = queryModel;
    this.type = Type.QUERYMODEL;
    this.cube = cube;
    this.name = name;
  }

  public ThinQuery(String name, SaikuCube cube, String mdx) {
    super();
    this.mdx = mdx;
    this.type = Type.MDX;
    this.cube = cube;
    this.name = name;
  }


  /**
   * @return the queryModel
   */
  @Nullable
  public ThinQueryModel getQueryModel() {
    return queryModel;
  }

  /**
   * @param queryModel the queryModel to set
   */
  public void setQueryModel(@Nullable ThinQueryModel queryModel) {
    this.queryModel = queryModel;
    if (queryModel != null) {
      this.type = Type.QUERYMODEL;
    }
  }

  /**
   * @return the cube
   */
  public SaikuCube getCube() {
    return cube;
  }

  /**
   * @param cube the cube to set
   */
  public void setCube(SaikuCube cube) {
    this.cube = cube;
  }

  /**
   * @return the mdx
   */
  public String getMdx() {
    return mdx;
  }

  @JsonIgnore
  public String getParameterResolvedMdx() {
    String replacedMdx = mdx;
    if (parameters != null) {
      replacedMdx = ServiceUtil.replaceParameters(replacedMdx, parameters);
    }
    return replacedMdx;

  }

  /**
   * @param mdx the mdx to set
   */
  public void setMdx(String mdx) {
    this.mdx = mdx;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the type
   */
  public Type getType() {
    return type;
  }

  /**
   * @param type the type to set
   */
  public void setType(Type type) {
    this.type = type;
  }

  /**
   * @return the parameters
   */
  public Map<String, String> getParameters() {
    return parameters;
  }

  /**
   * @param parameters the parameters to set
   */
  public void setParameters(Map<String, String> parameters) {
    this.parameters = parameters;
  }

  public void setParameter(String name, String value) {
    this.parameters.put(name, value);
  }

  @Nullable
  public String getParameter(String parameter) {
    if (parameters.containsKey(parameter)) {
      return parameters.get(parameter);
    }
    return null;
  }

  public void addParameter(String parameter) {
    if (StringUtils.isNotBlank(parameter)) {
      if (!parameters.containsKey(parameter)) {
        parameters.put(parameter, null);
      }
    }
  }

  public void addParameters(@Nullable List<String> parameters) {
    if (parameters != null) {
      for (String param : parameters) {
        addParameter(param);
      }
    }
  }

  public boolean hasAggregators() {
    return Type.QUERYMODEL.equals(type) && queryModel != null && queryModel.hasAggregators();

  }

  /**
   * @return the plugins
   */
  public Map<String, String> getPlugins() {
    return plugins;
  }

  /**
   * @param plugins the plugins to set
   */
  public void setPlugins(Map<String, String> plugins) {
    this.plugins = plugins;
  }

  /**
   * @return the properties
   */
  public Map<String, Object> getProperties() {
    return properties;
  }

  /**
   * @param properties the properties to set
   */
  public void setProperties(Map<String, Object> properties) {
    this.properties = properties;
  }

  /**
   * @return the metadata
   */
  public Map<String, String> getMetadata() {
    return metadata;
  }

  /**
   * @param metadata the metadata to set
   */
  public void setMetadata(Map<String, String> metadata) {
    this.metadata = metadata;
  }

  /**
   * @return the queryType
   */
  public String getQueryType() {
    return queryType;
  }

  /**
   * @param queryType the queryType to set
   */
  public void setQueryType(String queryType) {
    this.queryType = queryType;
  }
}

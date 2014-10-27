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
package org.saiku.service.olap;

import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.*;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.OlapConnection;
import org.olap4j.metadata.Cube;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import mondrian.rolap.RolapConnection;

/**
 * OlapDiscoverService.
 */
public class OlapDiscoverService implements Serializable {

  /**
   * SerialVersionUID
   */
  private static final long serialVersionUID = 884682532600907574L;

  private DatasourceService datasourceService;
  private OlapMetaExplorer metaExplorer;

  public void setDatasourceService(@NotNull DatasourceService ds) {
    datasourceService = ds;
    metaExplorer = new OlapMetaExplorer(ds.getConnectionManager());
  }

  @NotNull
  public List<SaikuCube> getAllCubes() throws SaikuOlapException {
    return metaExplorer.getAllCubes();
  }

  @NotNull
  public List<SaikuConnection> getAllConnections() throws SaikuServiceException {
    try {
      return metaExplorer.getAllConnections();
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot retrieve all connections", e);
    }
  }


  @NotNull
  public List<SaikuConnection> getConnection(String connectionName) {
    List<SaikuConnection> connections = new ArrayList<SaikuConnection>();
    try {
      SaikuConnection c = metaExplorer.getConnection(connectionName);
      connections.add(c);
      return connections;
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot retrieve all connections", e);
    }
  }


  public void refreshAllConnections() throws SaikuServiceException {
    try {
      datasourceService.getConnectionManager().refreshAllConnections();
    } catch (Exception e) {
      throw new SaikuServiceException("Cannot refresh all connections", e);
    }
  }

  public void refreshConnection(String name) throws SaikuServiceException {
    try {
      datasourceService.getConnectionManager().refreshConnection(name);
    } catch (Exception e) {
      throw new SaikuServiceException("Cannot refresh all connections", e);
    }
  }

  @NotNull
  public Cube getNativeCube(@NotNull SaikuCube cube) throws SaikuServiceException {
    try {
      return metaExplorer.getNativeCube(cube);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get native cube for cube ( " + cube + " )", e);
    }
  }

  @Nullable
  public OlapConnection getNativeConnection(String name) throws SaikuServiceException {
    try {
      return metaExplorer.getNativeConnection(name);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get native connection for cube ( " + name + " )", e);
    }
  }

  @NotNull
  public List<SaikuDimension> getAllDimensions(@NotNull SaikuCube cube) throws SaikuServiceException {
    try {
      return metaExplorer.getAllDimensions(cube);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get all dimensions for cube ( " + cube + " )", e);
    }
  }

  @Nullable
  public SaikuDimension getDimension(@NotNull SaikuCube cube, String dimensionName) throws SaikuServiceException {
    try {
      return metaExplorer.getDimension(cube, dimensionName);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get dimension (" + dimensionName + " ) for cube ( " + cube + " )", e);
    }
  }

  @NotNull
  public List<SaikuHierarchy> getAllHierarchies(@NotNull SaikuCube cube) throws SaikuServiceException {
    try {
      return metaExplorer.getAllHierarchies(cube);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get all hierarchies for cube ( " + cube + " )", e);
    }
  }

  public List<SaikuHierarchy> getAllDimensionHierarchies(@NotNull SaikuCube cube, String dimensionName) {
    try {
      SaikuDimension dim = metaExplorer.getDimension(cube, dimensionName);
      if (dim == null) {
        throw new SaikuServiceException("Cannot find dimension ( " + dimensionName + ") for cube ( " + cube + " )");
      }
      return dim.getHierarchies();

    } catch (SaikuOlapException e) {
      throw new SaikuServiceException(
          "Cannot get all hierarchies for cube ( " + cube + " ) dimension ( " + dimensionName + " )", e);
    }
  }

  @NotNull
  public List<SaikuLevel> getAllHierarchyLevels(@NotNull SaikuCube cube, String dimensionName, String hierarchyName) {
    try {

      return metaExplorer.getAllLevels(cube, dimensionName, hierarchyName);

    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get all levels for cube ( " + cube
                                      + " ) dimension ( " + dimensionName + " ) hierarchy ( " + hierarchyName + " )",
          e);

    }
  }

  public List<SimpleCubeElement> getLevelMembers(@NotNull SaikuCube cube, String hierarchyName, String levelName) {
    return getLevelMembers(cube, hierarchyName, levelName, null, -1);
  }

  public List<SimpleCubeElement> getLevelMembers(@NotNull SaikuCube cube, String hierarchyName, String levelName,
                                                 int searchLimit) {
    return getLevelMembers(cube, hierarchyName, levelName, null, searchLimit);
  }

  public List<SimpleCubeElement> getLevelMembers(@NotNull SaikuCube cube, String hierarchyName, String levelName,
                                                 @NotNull String searchString, int searchLimit) {
    try {

      return metaExplorer.getAllMembers(cube, hierarchyName, levelName, searchString, searchLimit);

    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get all members for cube ( " + cube
                                      + " ) hierarchy ( " + hierarchyName + " )", e);
    }
  }

  @NotNull
  public List<SaikuMember> getMeasures(@NotNull SaikuCube cube) {
    try {
      return metaExplorer.getAllMeasures(cube);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException("Cannot get all measures for cube ( " + cube + " )", e);
    }
  }

  @NotNull
  public List<SaikuMember> getHierarchyRootMembers(@NotNull SaikuCube cube, String hierarchyName) {
    try {
      return metaExplorer.getHierarchyRootMembers(cube, hierarchyName);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException(e);
    }
  }

  @NotNull
  public List<SaikuMember> getMemberChildren(@NotNull SaikuCube cube, String uniqueMemberName) {
    try {
      return metaExplorer.getMemberChildren(cube, uniqueMemberName);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException(e);
    }
  }

  @Nullable
  public SaikuMember getMember(@NotNull SaikuCube cube, String uniqueMemberName) {
    try {
      return metaExplorer.getMember(cube, uniqueMemberName);
    } catch (SaikuOlapException e) {
      throw new SaikuServiceException(e);
    }
  }

  @NotNull
  public Map<String, Object> getProperties(@NotNull SaikuCube cube) {
    Map<String, Object> properties = new HashMap<String, Object>();
    try {
      Cube c = getNativeCube(cube);
      OlapConnection con = c.getSchema().getCatalog().getDatabase().getOlapConnection();
      properties.put("saiku.olap.query.drillthrough", c.isDrillThroughEnabled());
      properties.put("org.saiku.query.explain", con.isWrapperFor(RolapConnection.class));

      try {
        Boolean isScenario = c.getDimensions().get("Scenario") != null;
        properties.put("org.saiku.connection.scenario", isScenario);
      } catch (Exception e) {
        properties.put("org.saiku.connection.scenario", false);
      }
    } catch (Exception e) {
      throw new SaikuServiceException(e);
    }
    return properties;
  }
}

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
package mondrian.olap4j;

import org.olap4j.OlapException;
import org.olap4j.impl.ArrayNamedListImpl;
import org.olap4j.impl.Named;
import org.olap4j.metadata.*;

import java.util.AbstractList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import mondrian.olap.Annotation;
import mondrian.olap.LocalizedProperty;
import mondrian.olap.OlapElement;
import mondrian.olap.Role;
import mondrian.rolap.RolapConnection;
import mondrian.rolap.RolapCubeLevel;
import mondrian.server.Locus;

/**
 * Implementation of {@link org.olap4j.metadata.Level} for the Mondrian OLAP engine.
 *
 * @since May 25, 2007
 */
public class MondrianOlap4jLevel
    extends MondrianOlap4jMetadataElement
    implements Level, Named {
  final MondrianOlap4jSchema olap4jSchema;
  final mondrian.olap.Level level;

  /**
   * Creates a MondrianOlap4jLevel.
   *
   * @param olap4jSchema Schema
   * @param level        Mondrian level
   */
  MondrianOlap4jLevel(
      MondrianOlap4jSchema olap4jSchema,
      mondrian.olap.Level level) {
    this.olap4jSchema = olap4jSchema;
    this.level = level;
  }

  public boolean equals(Object obj) {
    return obj instanceof MondrianOlap4jLevel
           && level.equals(((MondrianOlap4jLevel) obj).level);
  }

  public int hashCode() {
    return level.hashCode();
  }

  public int getDepth() {
    return level.getDepth() - getDepthOffset();
  }

  private int getDepthOffset() {
    final Role.HierarchyAccess accessDetails =
        olap4jSchema.olap4jCatalog.olap4jDatabaseMetaData.olap4jConnection
            .getMondrianConnection2().getRole().getAccessDetails(
            level.getHierarchy());
    if (accessDetails == null) {
      return 0;
    }
    return accessDetails.getTopLevelDepth();
  }

  public Hierarchy getHierarchy() {
    return new MondrianOlap4jHierarchy(olap4jSchema, level.getHierarchy());
  }

  public Dimension getDimension() {
    return new MondrianOlap4jDimension(olap4jSchema, level.getDimension());
  }

  public boolean isCalculated() {
    return false;
  }

  public Type getLevelType() {
    return level.getLevelType();
  }

  public NamedList<Property> getProperties() {
    return getProperties(true);
  }

  /**
   * Returns a list of this level's properties, optionally including standard properties that are available on every
   * level.
   * <p/>
   * <p>NOTE: Not part of the mondrian.olap4j API.
   *
   * @param includeStandard Whether to include standard properties
   * @return List of properties
   */
  NamedList<Property> getProperties(boolean includeStandard) {
    final NamedList<Property> list = new ArrayNamedListImpl<Property>() {
      public String getName(Object property) {
        return ((Property) property).getName();
      }
    };
    // standard properties first
    if (includeStandard) {
      list.addAll(
          Arrays.asList(Property.StandardMemberProperty.values()));
      list.addAll(MondrianOlap4jProperty.MEMBER_EXTENSIONS.values());
    }
    // then level-specific properties
    for (mondrian.olap.Property property : level.getProperties()) {
      list.add(new MondrianOlap4jProperty(property));
    }
    return list;
  }

  public List<Member> getMembers() throws OlapException {
    final MondrianOlap4jConnection olap4jConnection =
        olap4jSchema.olap4jCatalog.olap4jDatabaseMetaData.olap4jConnection;
    final RolapConnection mondrianConnection =
        olap4jConnection.getMondrianConnection();
    return Locus.execute(
        mondrianConnection,
        "Reading members of level",
        new Locus.Action<List<Member>>() {
          public List<Member> execute() {
            final mondrian.olap.SchemaReader schemaReader;
            if (level instanceof RolapCubeLevel) {
              schemaReader =
                  ((RolapCubeLevel) level).getCube()
                                          .getSchemaReader(
                                              mondrianConnection.getRole())
                                          .withLocus();
            } else {
              schemaReader =
                  mondrianConnection.getSchemaReader()
                                    .withLocus();
            }
            final List<mondrian.olap.Member> levelMembers =
                schemaReader.getLevelMembers(level, true);
            return new AbstractList<Member>() {
              public Member get(int index) {
                return olap4jConnection.toOlap4j(
                    levelMembers.get(index));
              }

              public int size() {
                return levelMembers.size();
              }
            };
          }
        });
  }

  public String getName() {
    return level.getName();
  }

  public String getUniqueName() {
    return level.getUniqueName();
  }

  public String getCaption() {
    return level.getLocalized(
        LocalizedProperty.CAPTION,
        olap4jSchema.getLocale());
  }

  public String getDescription() {
    return level.getLocalized(
        LocalizedProperty.DESCRIPTION,
        olap4jSchema.getLocale());
  }

  public Map<String, Annotation> getAnnotations() {
    return level.getAnnotationMap();
  }

  public int getCardinality() {
    return level.getApproxRowCount();
  }

  public boolean isVisible() {
    return level.isVisible();
  }

  protected OlapElement getOlapElement() {
    return level;
  }
}

// End MondrianOlap4jLevel.java

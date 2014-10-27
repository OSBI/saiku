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

import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.common.AbstractThinSortableQuerySet;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.jetbrains.annotations.Nullable;
import org.olap4j.impl.NamedListImpl;
import org.olap4j.metadata.NamedList;

import java.util.ArrayList;
import java.util.List;

/**
 * ThinAxis.
 */
@JsonIgnoreProperties
public class ThinAxis extends AbstractThinSortableQuerySet {

  private AxisLocation location;
  @Nullable
  private List<ThinHierarchy> hierarchies = new NamedListImpl<ThinHierarchy>();
  private boolean nonEmpty;
  @Nullable
  private List<String> aggs = new ArrayList<String>();


  public ThinAxis() {
  }

  public ThinAxis(AxisLocation location, @Nullable NamedList<ThinHierarchy> hierarchies, boolean nonEmpty, @Nullable
  List<String> aggs) {
    this.location = location;
    if (hierarchies != null) {
      this.hierarchies = hierarchies;
    }
    if (aggs != null) {
      this.aggs = aggs;
    }
    this.nonEmpty = nonEmpty;
  }

  @JsonIgnore
  @Override
  public String getName() {
    return location.toString();
  }

  /**
   * @return the location
   */
  public AxisLocation getLocation() {
    return location;
  }

  /**
   * @param location the location to set
   */
  public void setLocation(AxisLocation location) {
    this.location = location;
  }

  /**
   * @return the hierarchies
   */
  @Nullable
  public List<ThinHierarchy> getHierarchies() {
    return hierarchies;
  }

  public ThinHierarchy getHierarchy(String name) {
    return ((NamedListImpl<ThinHierarchy>) hierarchies).get(name);
  }

  /**
   * @return the nonEmpty
   */
  public boolean isNonEmpty() {
    return nonEmpty;
  }

  /**
   * @param nonEmpty the nonEmpty to set
   */
  public void setNonEmpty(boolean nonEmpty) {
    this.nonEmpty = nonEmpty;
  }

  @Nullable
  public List<String> getAggregators() {
    return aggs;
  }

}

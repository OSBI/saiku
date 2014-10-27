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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ThinQueryModel.
 */
public class ThinQueryModel {

  private Map<AxisLocation, ThinAxis> axes = new HashMap<AxisLocation, ThinAxis>();
  private boolean visualTotals = false;
  private String visualTotalsPattern;
  private boolean lowestLevelsOnly = false;
  private ThinDetails details;
  private List<ThinCalculatedMeasure> calculatedMeasures = new ArrayList<ThinCalculatedMeasure>();

  /**
   * AxisLocation.
   */
  public enum AxisLocation {
    FILTER,
    COLUMNS,
    ROWS,
    PAGES
  }

  /**
   * @return the axes
   */
  public Map<AxisLocation, ThinAxis> getAxes() {
    return axes;
  }

  public ThinAxis getAxis(AxisLocation axis) {
    return axes.get(axis);
  }

  /**
   * @param axes the axes to set
   */
  public void setAxes(Map<AxisLocation, ThinAxis> axes) {
    this.axes = axes;
  }

  /**
   * @return the visualTotals
   */
  public boolean isVisualTotals() {
    return visualTotals;
  }

  /**
   * @param visualTotals the visualTotals to set
   */
  public void setVisualTotals(boolean visualTotals) {
    this.visualTotals = visualTotals;
  }

  /**
   * @return the visualTotalsPattern
   */
  public String getVisualTotalsPattern() {
    return visualTotalsPattern;
  }

  /**
   * @param visualTotalsPattern the visualTotalsPattern to set
   */
  public void setVisualTotalsPattern(String visualTotalsPattern) {
    this.visualTotalsPattern = visualTotalsPattern;
  }

  /**
   * @return the lowestLevelsOnly
   */
  public boolean isLowestLevelsOnly() {
    return lowestLevelsOnly;
  }

  /**
   * @param visualTotals the visualTotals to set
   */
  public void setLowestLevelsOnly(boolean lowest) {
    this.lowestLevelsOnly = lowest;
  }

  public List<ThinCalculatedMeasure> getCalculatedMeasures() {
    return calculatedMeasures;
  }

  public void setCalculatedMeasures(List<ThinCalculatedMeasure> calculatedMeasures) {
    this.calculatedMeasures = calculatedMeasures;
  }

  public ThinDetails getDetails() {
    return details;
  }

  public void setDetails(ThinDetails details) {
    this.details = details;
  }

  public boolean hasAggregators() {
    if (axes != null) {
      for (ThinAxis ta : axes.values()) {
        if (ta.getAggregators().size() > 0) {
          return true;
        }
        if (ta.getHierarchies() != null) {
          for (ThinHierarchy th : ta.getHierarchies()) {
            for (ThinLevel tl : th.getLevels().values()) {
              if (tl.getAggregators() != null && tl.getAggregators().size() > 0) {
                return true;
              }
            }
          }
        }
      }
    }
    // TODO Auto-generated method stub
    return false;
  }
}

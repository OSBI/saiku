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

import java.util.ArrayList;
import java.util.List;

/**
 * ThinDetails.
 */
public class ThinDetails {

  private ThinQueryModel.AxisLocation axis;
  private Location location = Location.BOTTOM;
  private List<ThinMeasure> measures = new ArrayList<ThinMeasure>();

  /**
   * Details Location.
   */
  public enum Location {
    TOP,
    BOTTOM
  }

  public ThinDetails() {
  }

  public ThinDetails(AxisLocation axis, Location location, List<ThinMeasure> measures) {
    this.axis = axis;
    this.measures = measures;
    this.location = location;
  }

  /**
   * @return the axis
   */
  public ThinQueryModel.AxisLocation getAxis() {
    return axis;
  }

  /**
   * @return the location
   */
  public Location getLocation() {
    return location;
  }

  /**
   * @return the measures
   */
  public List<ThinMeasure> getMeasures() {
    return measures;
  }


}

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
package org.saiku.olap.dto;

import java.util.List;
import java.util.Map;

/**
 * SaikuCubMetadata.
 */
public class SaikuCubeMetadata {

  private final List<SaikuDimension> dimensions;
  private final List<SaikuMember> measures;
  private final Map<String, Object> properties;


  public SaikuCubeMetadata(List<SaikuDimension> dimensions, List<SaikuMember> measures,
                           Map<String, Object> properties) {
    this.dimensions = dimensions;
    this.measures = measures;
    this.properties = properties;
  }


  /**
   * @return the dimensions
   */
  public List<SaikuDimension> getDimensions() {
    return dimensions;
  }

  /**
   * @return the measures
   */
  public List<SaikuMember> getMeasures() {
    return measures;
  }


  /**
   * @return the properties
   */
  public Map<String, Object> getProperties() {
    return properties;
  }


}

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

/**
 * SaikuMeasure.
 */
public class SaikuMeasure extends SaikuMember {

  private Boolean calculated;

  public SaikuMeasure() {
  }

  public SaikuMeasure(
      String name,
      String uniqueName,
      String caption,
      String description,
      String dimensionUniqueName,
      String hierarchyUniqueName,
      String levelUniqueName,
      boolean visible,
      boolean calculated) {
    super(name, uniqueName, caption, description, dimensionUniqueName, hierarchyUniqueName, levelUniqueName);
    this.calculated = calculated;
  }

  /**
   * @return the calculated
   */
  public Boolean isCalculated() {
    return calculated;
  }


}

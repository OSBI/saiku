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

import java.util.HashMap;
import java.util.Map;

/**
 * ThinCalculatedMeasure.
 */
public class ThinCalculatedMeasure {

  private String name;
  private String uniqueName;
  private String caption;
  private Map<String, String> properties = new HashMap<String, String>();
  private String formula;
  private String hierarchyName;

  public ThinCalculatedMeasure() {
  }

  public ThinCalculatedMeasure(String hierarchyName, String name, String uniqueName, String caption, String formula,
                               Map<String, String> properties) {
    this.hierarchyName = hierarchyName;
    this.uniqueName = uniqueName;
    this.formula = formula;
    this.name = name;
    this.caption = caption;
    this.properties = properties;
  }

  /**
   * @return the uniqueName
   */
  public String getUniqueName() {
    return uniqueName;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the caption
   */
  public String getCaption() {
    return caption;
  }

  /**
   * @return the properties
   */
  public Map<String, String> getProperties() {
    return properties;
  }

  /**
   * @return the formula
   */
  public String getFormula() {
    return formula;
  }

  /**
   * @return the hierarchyUniqueName
   */
  public String getHierarchyName() {
    return hierarchyName;
  }


}

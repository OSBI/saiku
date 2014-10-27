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

/**
 * ThinMeasure.
 */
public class ThinMeasure {


  private String name;
  private String uniqueName;
  private String caption;
  private Type type;


  /**
   * Measure Type.
   */
  public enum Type {
    CALCULATED,
    EXACT
  }

  public ThinMeasure() {
  }

  public ThinMeasure(String name, String uniqueName, String caption, Type type) {
    this.name = name;
    this.uniqueName = uniqueName;
    this.caption = caption;
    this.type = type;
  }

  /**
   * @return the type
   */
  public Type getType() {
    return type;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the uniqueName
   */
  public String getUniqueName() {
    return uniqueName;
  }

  /**
   * @return the caption
   */
  public String getCaption() {
    return caption;
  }


}

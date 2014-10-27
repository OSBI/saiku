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
 * Parameter.
 */
public class Parameter {

  private String name;
  private String value;
  private ParameterType type = ParameterType.SIMPLE;
  private boolean mandatory = false;

  /**
   * Parameter Type.
   */
  public enum ParameterType {
    SIMPLE,
    LIST,
    MDX
  }

  public Parameter() {
  }

  public Parameter(ParameterType type, String name, String value, boolean mandatory) {
    this.type = type;
    this.value = value;
    this.name = name;
    this.mandatory = mandatory;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the value
   */
  public String getValue() {
    return value;
  }

  /**
   * @return the type
   */
  public ParameterType getType() {
    return type;
  }

  public boolean isMandatory() {
    return mandatory;
  }


}

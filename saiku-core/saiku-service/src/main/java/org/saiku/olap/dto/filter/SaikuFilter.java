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
package org.saiku.olap.dto.filter;

import org.saiku.olap.dto.SimpleCubeElement;

import java.util.ArrayList;
import java.util.List;

/**
 * SaikuFilter.
 */
public class SaikuFilter {

  private String name;
  private String description;
  private SimpleCubeElement dimension;


  private SimpleCubeElement hierarchy;
  private List<SimpleCubeElement> members = new ArrayList<SimpleCubeElement>();
  private String owner;

  public SaikuFilter() {
  }

  public SaikuFilter(String name, SimpleCubeElement dimension, SimpleCubeElement hierarchy,
                     List<SimpleCubeElement> members) {
    this(name, null, dimension, hierarchy, members);
  }

  public SaikuFilter(String name, String description, SimpleCubeElement dimension, SimpleCubeElement hierarchy,
                     List<SimpleCubeElement> members) {
    this.name = name;
    this.description = description;
    this.dimension = dimension;
    this.hierarchy = hierarchy;
    this.members = members;
    this.owner = null;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the description
   */
  public String getDescription() {
    return description;
  }

  /**
   * @return the dimension
   */
  public SimpleCubeElement getDimension() {
    return dimension;
  }

  /**
   * @return the hierarchy
   */
  public SimpleCubeElement getHierarchy() {
    return hierarchy;
  }

  /**
   * @return the members
   */
  public List<SimpleCubeElement> getMembers() {
    return members;
  }

  /**
   * @return the owner
   */
  public String getOwner() {
    return owner;
  }

  public void setOwner(String owner) {
    this.owner = owner;
  }

}

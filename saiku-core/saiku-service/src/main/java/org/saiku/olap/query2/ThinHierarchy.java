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

import org.saiku.olap.query2.common.AbstractThinSortableQuerySet;

import org.jetbrains.annotations.Nullable;
import org.olap4j.impl.Named;

import java.util.HashMap;
import java.util.Map;

/**
 * ThinHierarchy.
 */
public class ThinHierarchy extends AbstractThinSortableQuerySet implements Named {

  private String name;
  private String caption;
  private String dimension;

  @Nullable
  private Map<String, ThinLevel> levels = new HashMap<String, ThinLevel>();

  public ThinHierarchy() {
  }

  public ThinHierarchy(String uniqueName, String caption, String dimension, @Nullable Map<String, ThinLevel> levels) {
    this.name = uniqueName;
    this.caption = caption;
    this.dimension = dimension;
    if (levels != null) {
      this.levels = levels;
    }
  }

  @Override
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
   * @param caption the caption to set
   */
  public void setCaption(String caption) {
    this.caption = caption;
  }

  /**
   * @return the levels
   */
  @Nullable
  public Map<String, ThinLevel> getLevels() {
    return levels;
  }

  @Nullable
  public ThinLevel getLevel(String name) {
    if (levels.containsKey(name)) {
      return levels.get(name);
    }
    return null;

  }

  /**
   * @param levels the levels to set
   */
  public void setLevels(Map<String, ThinLevel> levels) {
    this.levels = levels;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the dimension
   */
  public String getDimension() {
    return dimension;
  }

  /**
   * @param dimension the dimension to set
   */
  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

}

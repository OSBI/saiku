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

import org.saiku.olap.query2.common.AbstractThinQuerySet;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;

/**
 * ThinLevel.
 */
public class ThinLevel extends AbstractThinQuerySet {

  private String name;
  private String caption;
  private ThinSelection selection;
  @NotNull
  private final List<String> aggregators = new ArrayList<String>();

  public ThinLevel() {
  }

  public ThinLevel(String name, String caption, ThinSelection selections, @Nullable List<String> aggregators) {
    this.name = name;
    this.caption = caption;
    this.selection = selections;
    if (aggregators != null) {
      this.aggregators.addAll(aggregators);
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
   * @return the selections
   */
  public ThinSelection getSelection() {
    return selection;
  }

  @NotNull
  public List<String> getAggregators() {
    return aggregators;
  }
}

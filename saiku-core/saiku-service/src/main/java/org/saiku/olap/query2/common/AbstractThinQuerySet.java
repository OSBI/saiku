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
package org.saiku.olap.query2.common;

import org.saiku.olap.query2.filter.ThinFilter;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * AbstractThinQuerySet.
 */
public abstract class AbstractThinQuerySet implements ThinQuerySet {


  private String mdx;

  @NotNull
  private final List<ThinFilter> filters = new ArrayList<ThinFilter>();

  public abstract String getName();

  public void setMdx(String mdx) {
    this.mdx = mdx;

  }

  public String getMdx() {
    return this.mdx;
  }

  public void addFilter(ThinFilter filter) {
    filters.add(filter);
  }

  public void setFilter(int index, ThinFilter filter) {
    filters.set(index, filter);
  }

  @NotNull
  public List<ThinFilter> getFilters() {
    return filters;
  }

  public void clearFilters() {
    filters.clear();
  }
}

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

import org.jetbrains.annotations.Nullable;

/**
 * AbstractThinSortableQuerySet.
 */
public abstract class AbstractThinSortableQuerySet extends AbstractThinQuerySet implements ThinSortableQuerySet {

  @Nullable
  private SortOrder sortOrder;
  @Nullable
  private String sortEvaluationLiteral;
  @Nullable
  private HierarchizeMode hierarchizeMode;

  public void sort(SortOrder order) {
    this.sortOrder = order;

  }

  public void sort(SortOrder order, String sortEvaluationLiteral) {
    this.sortOrder = order;
    this.sortEvaluationLiteral = sortEvaluationLiteral;
  }

  @Nullable
  public SortOrder getSortOrder() {
    return sortOrder;
  }

  @Nullable
  public String getSortEvaluationLiteral() {
    return sortEvaluationLiteral;
  }

  public void clearSort() {
    this.sortOrder = null;
    this.sortEvaluationLiteral = null;
  }

  @Nullable
  public HierarchizeMode getHierarchizeMode() {
    return this.hierarchizeMode;
  }

  public void setHierarchizeMode(HierarchizeMode hierarchizeMode) {
    this.hierarchizeMode = hierarchizeMode;

  }

  public void clearHierarchizeMode() {
    this.hierarchizeMode = null;

  }


}

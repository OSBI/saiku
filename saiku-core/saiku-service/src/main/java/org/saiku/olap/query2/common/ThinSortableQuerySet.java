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

/**
 * ThinSortableQuerySet.
 */
public interface ThinSortableQuerySet extends ThinQuerySet {

  /**
   * Sorts the Hierarchy members by name in the order supplied as a parameter.
   *
   * @param order The {@link SortOrder} to use.
   */
  void sort(SortOrder order);

  /**
   * Sorts the Hierarchy members by name in the order supplied as a parameter using the given sort evaluation literal
   *
   * @param order The {@link SortOrder} to use.
   */
  void sort(SortOrder order, String sortEvaluationLiteral);

  /**
   * Returns the current order in which the Hierarchy members are sorted.
   *
   * @return A value of {@link SortOrder}
   */
  SortOrder getSortOrder();

  /**
   * Returns the current literal used for sorting
   *
   * @return A sort evaluation literal
   */
  String getSortEvaluationLiteral();

  /**
   * Clears the current sorting settings.
   */
  void clearSort();


  /**
   * Returns the current mode of hierarchization, or null if no hierarchization is currently performed.
   * <p/>
   * <p>This capability is only available when a single Hierarchy is selected on an axis
   *
   * @return Either a hierarchization mode value or null if no hierarchization is currently performed.
   */
  HierarchizeMode getHierarchizeMode();

  /**
   * Triggers the hierarchization of the included members within this QueryHierarchy.
   * <p/>
   * <p>The Hierarchy inclusions will be wrapped in an MDX Hierarchize function call.
   * <p/>
   * <p>This capability is only available when a single Hierarchy is selected on an axis.
   *
   * @param hierarchizeMode If parents should be included before or after their children. (Equivalent to the POST/PRE
   *                        MDX literal for the Hierarchize() function) inside the Hierarchize() MDX function call.
   */
  void setHierarchizeMode(HierarchizeMode hierarchizeMode);

  /**
   * Tells the QueryHierarchy not to hierarchize its included selections.
   * <p/>
   * <p>This capability is only available when a single Hierarchy is selected on an axis.
   */
  void clearHierarchizeMode();

  /**
   * Defines in which way the hierarchize operation should be performed.
   */
  static enum HierarchizeMode {
    /**
     * Parents are placed before children.
     */
    PRE,
    /**
     * Parents are placed after children
     */
    POST
  }

  /**
   * Sort Order.
   */
  enum SortOrder {
    /**
     * Ascending sort order. Members of the same hierarchy are still kept together.
     */
    ASC,
    /**
     * Descending sort order. Members of the same hierarchy are still kept together.
     */
    DESC,
    /**
     * Sorts in ascending order, but does not maintain members of a same hierarchy together. This is known as a "break
     * hierarchy ascending sort".
     */
    BASC,
    /**
     * Sorts in descending order, but does not maintain members of a same hierarchy together. This is known as a "break
     * hierarchy descending sort".
     */
    BDESC
  }

}

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
package org.saiku.olap.query2.filter;

import java.util.ArrayList;
import java.util.List;

/**
 * ThinFilter.
 */
public class ThinFilter {

  private FilterFlavour flavour;
  private FilterOperator operator;
  private FilterFunction function;
  private List<String> expressions = new ArrayList<String>();

  /**
   * FilterFlavour.
   */
  public enum FilterFlavour {
    Generic, Measure, Name, NameLike, N
  }

  /**
   * FilterOperator.
   */
  public enum FilterOperator {
    EQUALS, GREATER, GREATER_EQUALS, SMALLER, SMALLER_EQUALS, LIKE
  }

  /**
   * FilterFunction.
   */
  public enum FilterFunction {
    Filter, TopCount, TopPercent, TopSum, BottomCount, BottomPercent, BottomSum
  }

  public ThinFilter() {
  }

  public ThinFilter(
      FilterFlavour flavour,
      FilterOperator operator,
      FilterFunction function,
      List<String> expressions) {
    this.flavour = flavour;
    this.operator = operator;
    this.function = function;
    this.expressions = expressions;
  }

  /**
   * @return the flavour
   */
  public FilterFlavour getFlavour() {
    return flavour;
  }

  /**
   * @return the operator
   */
  public FilterOperator getOperator() {
    return operator;
  }

  /**
   * @return the function
   */
  public FilterFunction getFunction() {
    return function;
  }

  /**
   * @return the expressions
   */
  public List<String> getExpressions() {
    return expressions;
  }


}

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
package org.saiku.olap.util;

import org.saiku.olap.util.exception.SaikuIncompatibleException;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.SortOrder;
import org.saiku.query.mdx.GenericFilter;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.mdx.NFilter;

import org.jetbrains.annotations.NotNull;
import org.olap4j.mdx.SelectNode;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.olap4j.query.Selection;
import org.olap4j.query.Selection.Operator;

/**
 * QueryConverter.
 */
public class QueryConverter {

  private QueryConverter() {

  }

  public static SelectNode convert(@NotNull Query query) throws Exception {
    org.saiku.query.Query sQuery = convertQuery(query);
    return sQuery.getSelect();
  }

  @NotNull
  public static org.saiku.query.Query convertQuery(@NotNull Query query) throws Exception {
    org.saiku.query.Query sQuery = new org.saiku.query.Query(query.getName(), query.getCube());

    for (QueryAxis axis : query.getAxes().values()) {
      if (axis.getLocation() != null) {
        org.saiku.query.QueryAxis sAxis = sQuery.getAxis(axis.getLocation());
        convertAxis(axis, sAxis, sQuery);
      }

    }
    return sQuery;
  }

  private static void convertAxis(@NotNull QueryAxis axis, @NotNull org.saiku.query.QueryAxis sAxis,
                                  @NotNull org.saiku.query.Query sQuery)
      throws Exception {

    for (QueryDimension qD : axis.getDimensions()) {
      convertDimension(qD, sAxis, sQuery);
    }

    if (axis.getSortOrder() != null) {
      SortOrder so = SortOrder.valueOf(axis.getSortOrder().toString());
      sAxis.sort(so, axis.getSortIdentifierNodeName());
    }

    if (axis.getFilterCondition() != null) {
      sAxis.addFilter(new GenericFilter(axis.getFilterCondition()));
    }

    if (axis.getLimitFunction() != null) {
      NFilter nf = new NFilter(MdxFunctionType.valueOf(
          axis.getLimitFunction().toString()),
          axis.getLimitFunctionN().intValue(),
          axis.getLimitFunctionSortLiteral());
      sAxis.addFilter(nf);
    }

    sAxis.setNonEmpty(axis.isNonEmpty());


  }

  private static void convertDimension(
      @NotNull QueryDimension qD, @NotNull org.saiku.query.QueryAxis sAxis, @NotNull org.saiku.query.Query sQuery)
      throws Exception {
    boolean first = true;
    String hierarchyName = null;
    QueryHierarchy qh = null;
    for (Selection sel : qD.getInclusions()) {
      if (first) {
        if (sel.getRootElement() instanceof Member) {
          hierarchyName = ((Member) sel.getRootElement()).getHierarchy().getUniqueName();
        } else {
          hierarchyName = ((Level) sel.getRootElement()).getHierarchy().getUniqueName();
        }

        qh = sQuery.getHierarchy(hierarchyName);
        first = false;
      }

      if (sel.getSelectionContext() != null) {
        throw new SaikuIncompatibleException("Cannot convert queries with selection context");
      }
      if (sel.getRootElement() instanceof Member) {
        if (sel.getOperator().equals(Operator.MEMBER)) {
          qh.includeMember(sel.getRootElement().getUniqueName());
        } else {
          throw new SaikuIncompatibleException("Cannot convert member selection using operator: " + sel.getOperator());
        }
      } else {
        qh.includeLevel(sel.getRootElement().getName());
      }
    }
    sAxis.addHierarchy(qh);

  }

}

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
package org.saiku.olap.query2.util;

import org.saiku.olap.query2.*;
import org.saiku.olap.query2.ThinMeasure.Type;
import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.common.ThinQuerySet;
import org.saiku.olap.query2.common.ThinSortableQuerySet;
import org.saiku.olap.query2.filter.ThinFilter;
import org.saiku.query.*;
import org.saiku.query.QueryDetails.Location;
import org.saiku.query.mdx.*;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.metadata.CalculatedMeasure;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.Axis;
import org.olap4j.OlapException;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Measure;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Fat.
 */
public class Fat {

  private Fat() {

  }

  @NotNull
  public static Query convert(@NotNull ThinQuery tq, Cube cube) throws SQLException {

    Query q = new Query(tq.getName(), cube);
    if (tq.getParameters() != null) {
      q.setParameters(tq.getParameters());
    }

    if (tq.getQueryModel() == null) {
      return q;
    }

    ThinQueryModel model = tq.getQueryModel();
    convertAxes(q, tq.getQueryModel().getAxes(), tq);
    convertCalculatedMeasures(q, model.getCalculatedMeasures());
    convertDetails(q, model.getDetails());
    q.setVisualTotals(model.isVisualTotals());
    q.setVisualTotalsPattern(model.getVisualTotalsPattern());
    return q;
  }

  private static void convertCalculatedMeasures(@NotNull Query q, @Nullable List<ThinCalculatedMeasure> thinCms) {
    if (thinCms != null && thinCms.size() > 0) {
      for (ThinCalculatedMeasure qcm : thinCms) {
        // TODO improve this
        Hierarchy h = q.getCube().getMeasures().get(0).getHierarchy();

        CalculatedMeasure cm =
            new CalculatedMeasure(
                h,
                qcm.getName(),
                null,
                qcm.getFormula(),
                qcm.getProperties());

        q.addCalculatedMeasure(cm);
      }
    }
  }

  private static void convertDetails(@NotNull Query query, @NotNull ThinDetails details) {
    Location loc = Location.valueOf(details.getLocation().toString());
    query.getDetails().setLocation(loc);
    Axis ax = getLocation(details.getAxis());
    query.getDetails().setAxis(ax);

    if (details.getMeasures().size() > 0) {
      for (ThinMeasure m : details.getMeasures()) {
        if (Type.CALCULATED.equals(m.getType())) {
          Measure measure = query.getCalculatedMeasure(m.getName());
          query.getDetails().add(measure);
        } else if (Type.EXACT.equals(m.getType())) {
          Measure measure = query.getMeasure(m.getName());
          query.getDetails().add(measure);
        }
      }
    }
  }

  private static void convertAxes(@NotNull Query q, @Nullable Map<AxisLocation, ThinAxis> axes, ThinQuery tq)
      throws OlapException {
    if (axes != null) {
      for (AxisLocation axis : sortAxes(axes.keySet())) {
        if (axis != null) {
          convertAxis(q, axes.get(axis), tq);
        }
      }
    }
  }

  @NotNull
  private static List<AxisLocation> sortAxes(@NotNull Set<AxisLocation> axes) {
    List<AxisLocation> ax = new ArrayList<AxisLocation>();
    for (AxisLocation a : AxisLocation.values()) {
      if (axes.contains(a)) {
        ax.add(a);
      }
    }
    return ax;
  }


  private static void convertAxis(@NotNull Query query, @NotNull ThinAxis thinAxis, ThinQuery tq) throws OlapException {
    Axis loc = getLocation(thinAxis.getLocation());
    QueryAxis qaxis = query.getAxis(loc);
    for (ThinHierarchy hierarchy : thinAxis.getHierarchies()) {
      QueryHierarchy qh = query.getHierarchy(hierarchy.getName());
      if (qh != null) {
        convertHierarchy(qh, hierarchy, tq);
        qaxis.addHierarchy(qh);
      }
    }
    qaxis.setNonEmpty(thinAxis.isNonEmpty());
    List<String> aggs = thinAxis.getAggregators();
    qaxis.getQuery().setAggregators(qaxis.getLocation().toString(), aggs);
    extendSortableQuerySet(query, qaxis, thinAxis);
  }

  private static void convertHierarchy(@NotNull QueryHierarchy qh, @NotNull ThinHierarchy th, ThinQuery tq)
      throws OlapException {
    for (ThinLevel tl : th.getLevels().values()) {
      QueryLevel ql = qh.includeLevel(tl.getName());

      List<String> aggs = tl.getAggregators();
      qh.getQuery().setAggregators(ql.getUniqueName(), aggs);

      if (tl.getSelection() != null) {
        String parameter = tl.getSelection().getParameterName();
        if (StringUtils.isNotBlank(parameter)) {
          ql.setParameterName(parameter);
          ql.setParameterSelectionType(org.saiku.query.Parameter.SelectionType.INCLUSION);
        }
        switch (tl.getSelection().getType()) {
        case INCLUSION:
//if (parameterValues != null) {
//for (String m : parameterValues) {
//qh.includeMember(m);
//}
//
//} else {
          for (ThinMember tm : tl.getSelection().getMembers()) {
            qh.includeMember(tm.getUniqueName());
          }
          ql.setParameterSelectionType(org.saiku.query.Parameter.SelectionType.INCLUSION);
//}
          break;

        case EXCLUSION:
//if (parameterValues != null) {
//for (String m : parameterValues) {
//qh.excludeMember(m);
//}
//
//} else {
          for (ThinMember tm : tl.getSelection().getMembers()) {
            qh.excludeMember(tm.getUniqueName());
          }
          ql.setParameterSelectionType(org.saiku.query.Parameter.SelectionType.EXCLUSION);
//}
          break;
        case RANGE:
          int size = tl.getSelection().getMembers().size();
          int iterations = tl.getSelection().getMembers().size() / 2;
          if (size > 2 && size % 2 == 0) {
            for (int i = 0; i < iterations; i++) {
              ThinMember start = tl.getSelection().getMembers().get(iterations * 2 + i);
              ThinMember end = tl.getSelection().getMembers().get(iterations * 2 + i + 1);
              qh.includeRange(start.getUniqueName(), end.getUniqueName());
            }
          }
          break;
        default:
          break;

        }
      }

      extendQuerySet(qh.getQuery(), ql, tl);
    }
    extendSortableQuerySet(qh.getQuery(), qh, th);
  }


  @Nullable
  private static Axis getLocation(@NotNull AxisLocation axis) {
    String ax = axis.toString();
    if (AxisLocation.ROWS.toString().equals(ax)) {
      return Axis.ROWS;
    } else if (AxisLocation.COLUMNS.toString().equals(ax)) {
      return Axis.COLUMNS;
    } else if (AxisLocation.FILTER.toString().equals(ax)) {
      return Axis.FILTER;
    } else if (AxisLocation.PAGES.toString().equals(ax)) {
      return Axis.PAGES;
    }
    return null;
  }

  private static void extendQuerySet(@NotNull Query q, @NotNull IQuerySet qs, @NotNull ThinQuerySet ts) {
    qs.setMdxSetExpression(ts.getMdx());

    if (ts.getFilters() != null && ts.getFilters().size() > 0) {
      List<IFilterFunction> filters = convertFilters(q, ts.getFilters());
      qs.getFilters().addAll(filters);
    }

  }

  @NotNull
  private static List<IFilterFunction> convertFilters(@NotNull Query q, @NotNull List<ThinFilter> filters) {
    List<IFilterFunction> qfs = new ArrayList<IFilterFunction>();
    for (ThinFilter f : filters) {
      switch (f.getFlavour()) {
      case Name:
        List<String> exp = f.getExpressions();
        if (exp != null && exp.size() > 1) {
          String hierarchyName = exp.remove(0);
          QueryHierarchy qh = q.getHierarchy(hierarchyName);
          NameFilter nf = new NameFilter(qh.getHierarchy(), exp);
          qfs.add(nf);
        }
        break;
      case NameLike:
        List<String> exp2 = f.getExpressions();
        if (exp2 != null && exp2.size() > 1) {
          String hierarchyName = exp2.remove(0);
          QueryHierarchy qh = q.getHierarchy(hierarchyName);
          NameLikeFilter nf = new NameLikeFilter(qh.getHierarchy(), exp2);
          qfs.add(nf);
        }
        break;
      case Generic:
        List<String> gexp = f.getExpressions();
        if (gexp != null && gexp.size() == 1) {
          GenericFilter gf = new GenericFilter(gexp.get(0));
          qfs.add(gf);
        }
        break;
      case Measure:
        // TODO Implement this
        break;
      case N:
        List<String> nexp = f.getExpressions();
        if (nexp != null && nexp.size() > 0) {
          MdxFunctionType mf = MdxFunctionType.valueOf(f.getFunction().toString());
          int n = Integer.parseInt(nexp.get(0));
          String expression = null;
          if (nexp.size() > 1) {
            expression = nexp.get(1);
          }
          NFilter nf = new NFilter(mf, n, expression);
          qfs.add(nf);
        }
        break;
      default:
        break;
      }
    }
    return qfs;
  }

  private static void extendSortableQuerySet(
      @NotNull Query q, @NotNull ISortableQuerySet qs, @NotNull ThinSortableQuerySet ts) {
    extendQuerySet(q, qs, ts);
    if (ts.getHierarchizeMode() != null) {
      qs.setHierarchizeMode(
          org.saiku.query.ISortableQuerySet.HierarchizeMode.valueOf(ts.getHierarchizeMode().toString()));
    }
    if (ts.getSortOrder() != null) {
      qs.sort(org.saiku.query.SortOrder.valueOf(ts.getSortOrder().toString()), ts.getSortEvaluationLiteral());
    }


  }


}

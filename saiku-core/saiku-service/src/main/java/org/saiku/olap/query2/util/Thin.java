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

import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.*;
import org.saiku.olap.query2.ThinMeasure.Type;
import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.common.ThinQuerySet;
import org.saiku.olap.query2.common.ThinSortableQuerySet;
import org.saiku.olap.query2.common.ThinSortableQuerySet.HierarchizeMode;
import org.saiku.olap.query2.common.ThinSortableQuerySet.SortOrder;
import org.saiku.olap.query2.filter.ThinFilter;
import org.saiku.olap.query2.filter.ThinFilter.FilterFlavour;
import org.saiku.olap.query2.filter.ThinFilter.FilterFunction;
import org.saiku.olap.query2.filter.ThinFilter.FilterOperator;
import org.saiku.query.*;
import org.saiku.query.mdx.*;
import org.saiku.query.metadata.CalculatedMeasure;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.Axis;
import org.olap4j.impl.NamedListImpl;
import org.olap4j.metadata.Measure;
import org.olap4j.metadata.Member;
import org.olap4j.metadata.NamedList;

import java.util.*;

/**
 * Thin.
 */
public class Thin {

  private Thin() {

  }

  @NotNull
  public static ThinQuery convert(@NotNull Query query, SaikuCube cube) throws Exception {
    ThinQuery tq = new ThinQuery(query.getName(), cube);
    ThinQueryModel tqm = convert(query, tq);
    tq.setQueryModel(tqm);

    if (query.getParameters() != null) {
      query.retrieveParameters();
      tq.setParameters(query.getParameters());
    }
    tq.setMdx(query.getMdx());
    return tq;
  }

  @NotNull
  private static ThinQueryModel convert(@NotNull Query query, @NotNull ThinQuery tq) {
    ThinQueryModel tqm = new ThinQueryModel();
    tqm.setAxes(convertAxes(query.getAxes(), tq));
    ThinDetails td = convert(query.getDetails());
    tqm.setDetails(td);
    List<ThinCalculatedMeasure> cms = convert(query.getCalculatedMeasures());
    tqm.setCalculatedMeasures(cms);
    tqm.setVisualTotals(query.isVisualTotals());
    tqm.setVisualTotalsPattern(query.getVisualTotalsPattern());

    return tqm;
  }

  @NotNull
  private static List<ThinCalculatedMeasure> convert(@Nullable List<CalculatedMeasure> qcms) {
    List<ThinCalculatedMeasure> tcms = new ArrayList<ThinCalculatedMeasure>();
    if (qcms != null && qcms.size() > 0) {
      for (CalculatedMeasure qcm : qcms) {
        ThinCalculatedMeasure tcm = new ThinCalculatedMeasure(
            qcm.getHierarchy().getUniqueName(),
            qcm.getName(),
            qcm.getUniqueName(),
            qcm.getCaption(),
            qcm.getFormula(),
            qcm.getFormatProperties());
        tcms.add(tcm);
      }
    }

    return tcms;
  }

  @NotNull
  private static ThinDetails convert(@NotNull QueryDetails details) {
    ThinDetails.Location location = ThinDetails.Location.valueOf(details.getLocation().toString());
    AxisLocation axis = AxisLocation.valueOf(details.getAxis().toString());
    List<ThinMeasure> measures = new ArrayList<ThinMeasure>();
    if (details.getMeasures().size() > 0) {
      for (Measure m : details.getMeasures()) {
        ThinMeasure.Type type = Type.EXACT;
        if (m instanceof CalculatedMeasure) {
          type = Type.CALCULATED;
        }
        ThinMeasure tm = new ThinMeasure(m.getName(), m.getUniqueName(), m.getCaption(), type);
        measures.add(tm);
      }
    }
    return new ThinDetails(axis, location, measures);
  }

  @NotNull
  private static Map<AxisLocation, ThinAxis> convertAxes(@Nullable Map<Axis, QueryAxis> axes, @NotNull ThinQuery tq) {
    Map<ThinQueryModel.AxisLocation, ThinAxis> thinAxes = new TreeMap<ThinQueryModel.AxisLocation, ThinAxis>();
    if (axes != null) {
      for (Axis axis : sortAxes(axes.keySet())) {
        if (axis != null) {
          ThinAxis ta = convertAxis(axes.get(axis), tq);
          thinAxes.put(ta.getLocation(), ta);
        }
      }
    }
    return thinAxes;
  }

  @NotNull
  private static List<Axis> sortAxes(@NotNull Set<Axis> axes) {
    List<Axis> ax = new ArrayList<Axis>();
    for (Axis a : Axis.Standard.values()) {
      if (axes.contains(a)) {
        ax.add(a);
      }
    }
    return ax;
  }

  @NotNull
  private static ThinAxis convertAxis(@NotNull QueryAxis queryAxis, @NotNull ThinQuery tq) {
    AxisLocation loc = getLocation(queryAxis);
    List<String> aggs = queryAxis.getQuery().getAggregators(queryAxis.getLocation().toString());
    ThinAxis ta =
        new ThinAxis(loc, convertHierarchies(queryAxis.getQueryHierarchies(), tq), queryAxis.isNonEmpty(), aggs);
    extendSortableQuerySet(ta, queryAxis);
    return ta;
  }

  @NotNull
  private static NamedList<ThinHierarchy> convertHierarchies(
      @Nullable List<QueryHierarchy> queryHierarchies, @NotNull ThinQuery tq) {
    NamedListImpl<ThinHierarchy> hs = new NamedListImpl<ThinHierarchy>();
    if (queryHierarchies != null) {
      for (QueryHierarchy qh : queryHierarchies) {
        ThinHierarchy th = convertHierarchy(qh, tq);
        hs.add(th);
      }
    }
    return hs;
  }

  @NotNull
  private static ThinHierarchy convertHierarchy(@NotNull QueryHierarchy qh, @NotNull ThinQuery tq) {
    ThinHierarchy th =
        new ThinHierarchy(qh.getUniqueName(), qh.getCaption(), qh.getHierarchy().getDimension().getName(),
            convertLevels(qh.getActiveQueryLevels(), tq));
    extendSortableQuerySet(th, qh);
    return th;
  }

  @NotNull
  private static Map<String, ThinLevel> convertLevels(@Nullable List<QueryLevel> levels, @NotNull ThinQuery tq) {
    Map<String, ThinLevel> tl = new HashMap<String, ThinLevel>();
    if (levels != null) {
      for (QueryLevel ql : levels) {
        ThinLevel l = convertLevel(ql, tq);
        tl.put(ql.getName(), l);
      }
    }
    return tl;
  }

  @Nullable
  private static ThinLevel convertLevel(@NotNull QueryLevel ql, @NotNull ThinQuery tq) {
    List<ThinMember> inclusions = convertMembers(ql.getInclusions());
    List<ThinMember> exclusions = convertMembers(ql.getExclusions());
    ThinMember rangeStart = convertMember(ql.getRangeStart());
    ThinMember rangeEnd = convertMember(ql.getRangeEnd());
    ThinSelection ts = new ThinSelection(ThinSelection.Type.INCLUSION, null);

    if (inclusions.size() > 0) {
      ts = new ThinSelection(ThinSelection.Type.INCLUSION, inclusions);
    } else if (exclusions.size() > 0) {
      ts = new ThinSelection(ThinSelection.Type.EXCLUSION, exclusions);
    } else if (rangeStart != null && rangeEnd != null) {
      List<ThinMember> range = new ArrayList<ThinMember>();
      range.add(rangeStart);
      range.add(rangeEnd);
      ts = new ThinSelection(ThinSelection.Type.RANGE, range);
    }

    if (ql.hasParameter()) {
      ts.setParameterName(ql.getParameterName());
      tq.addParameter(ql.getParameterName());
    }
    List<String> aggs = ql.getQueryHierarchy().getQuery().getAggregators(ql.getUniqueName());
    ThinLevel l = new ThinLevel(ql.getName(), ql.getCaption(), ts, aggs);
    extendQuerySet(l, ql);
    return l;
  }

  @NotNull
  private static List<ThinMember> convertMembers(@Nullable List<Member> members) {
    List<ThinMember> ms = new ArrayList<ThinMember>();
    if (members != null) {
      for (Member m : members) {
        ms.add(convertMember(m));
      }
    }
    return ms;
  }

  @Nullable
  private static ThinMember convertMember(@Nullable Member m) {
    if (m != null) {
      return new ThinMember(m.getName(), m.getUniqueName(), m.getCaption());
    }
    return null;
  }

  @Nullable
  private static AxisLocation getLocation(@NotNull QueryAxis axis) {
    Axis ax = axis.getLocation();

    if (Axis.ROWS.equals(ax)) {
      return AxisLocation.ROWS;
    } else if (Axis.COLUMNS.equals(ax)) {
      return AxisLocation.COLUMNS;
    } else if (Axis.FILTER.equals(ax)) {
      return AxisLocation.FILTER;
    } else if (Axis.PAGES.equals(ax)) {
      return AxisLocation.PAGES;
    }
    return null;
  }

  private static void extendQuerySet(@NotNull ThinQuerySet ts, @NotNull IQuerySet qs) {
    if (StringUtils.isNotBlank(qs.getMdxSetExpression())) {
      ts.setMdx(qs.getMdxSetExpression());
    }
    if (qs.getFilters() != null && qs.getFilters().size() > 0) {
      List<ThinFilter> filters = convertFilters(qs.getFilters());
      ts.getFilters().addAll(filters);
    }

  }

  @NotNull
  private static List<ThinFilter> convertFilters(@NotNull List<IFilterFunction> filters) {
    List<ThinFilter> tfs = new ArrayList<ThinFilter>();
    for (IFilterFunction f : filters) {
      if (f instanceof NameFilter) {
        NameFilter nf = (NameFilter) f;
        List<String> expressions = nf.getFilterExpression();
        expressions.add(0, nf.getHierarchy().getUniqueName());
        ThinFilter tf = new ThinFilter(FilterFlavour.Name, FilterOperator.EQUALS, FilterFunction.Filter, expressions);
        tfs.add(tf);
      }
      if (f instanceof NameLikeFilter) {
        NameLikeFilter nf = (NameLikeFilter) f;
        List<String> expressions = nf.getFilterExpression();
        expressions.add(0, nf.getHierarchy().getUniqueName());
        ThinFilter tf = new ThinFilter(FilterFlavour.NameLike, FilterOperator.LIKE, FilterFunction.Filter, expressions);
        tfs.add(tf);
      }
      if (f instanceof GenericFilter) {
        GenericFilter nf = (GenericFilter) f;
        List<String> expressions = new ArrayList<String>();
        expressions.add(nf.getFilterExpression());
        ThinFilter tf = new ThinFilter(FilterFlavour.Generic, null, FilterFunction.Filter, expressions);
        tfs.add(tf);
      }
      if (f instanceof NFilter) {
        NFilter nf = (NFilter) f;
        List<String> expressions = new ArrayList<String>();
        expressions.add(Integer.toString(nf.getN()));
        if (nf.getFilterExpression() != null) {
          expressions.add(nf.getFilterExpression());
        }
        FilterFunction type = FilterFunction.valueOf(nf.getFunctionType().toString());
        ThinFilter tf = new ThinFilter(FilterFlavour.N, null, type, expressions);
        tfs.add(tf);
      }
    }
    return tfs;
  }

  private static void extendSortableQuerySet(@NotNull ThinSortableQuerySet ts, @NotNull ISortableQuerySet qs) {
    extendQuerySet(ts, qs);
    if (qs.getHierarchizeMode() != null) {
      ts.setHierarchizeMode(HierarchizeMode.valueOf(qs.getHierarchizeMode().toString()));
    }
    if (qs.getSortOrder() != null) {
      ts.sort(SortOrder.valueOf(qs.getSortOrder().toString()), qs.getSortEvaluationLiteral());
    }


  }


}

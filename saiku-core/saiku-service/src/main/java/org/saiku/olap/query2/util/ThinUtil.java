package org.saiku.olap.query2.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.olap4j.Axis;
import org.olap4j.metadata.Measure;
import org.olap4j.metadata.Member;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinAxis;
import org.saiku.olap.query2.ThinCalculatedMeasure;
import org.saiku.olap.query2.ThinDetails;
import org.saiku.olap.query2.ThinHierarchy;
import org.saiku.olap.query2.ThinLevel;
import org.saiku.olap.query2.ThinMeasure;
import org.saiku.olap.query2.ThinMeasure.Type;
import org.saiku.olap.query2.ThinMember;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.query2.ThinQueryModel;
import org.saiku.olap.query2.ThinQueryModel.AxisLocation;
import org.saiku.olap.query2.common.ThinQuerySet;
import org.saiku.olap.query2.common.ThinSortableQuerySet;
import org.saiku.olap.query2.common.ThinSortableQuerySet.HierarchizeMode;
import org.saiku.olap.query2.common.ThinSortableQuerySet.SortOrder;
import org.saiku.olap.query2.filter.ThinFilter;
import org.saiku.olap.query2.filter.ThinFilter.FilterFlavour;
import org.saiku.olap.query2.filter.ThinFilter.FilterFunction;
import org.saiku.olap.query2.filter.ThinFilter.FilterOperator;
import org.saiku.query.IQuerySet;
import org.saiku.query.ISortableQuerySet;
import org.saiku.query.Query;
import org.saiku.query.QueryAxis;
import org.saiku.query.QueryDetails;
import org.saiku.query.QueryDetails.Location;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.QueryLevel;
import org.saiku.query.mdx.GenericFilter;
import org.saiku.query.mdx.IFilterFunction;
import org.saiku.query.mdx.NFilter;
import org.saiku.query.mdx.NameFilter;
import org.saiku.query.mdx.NameLikeFilter;
import org.saiku.query.metadata.CalculatedMeasure;

public class ThinUtil {
	
	public static ThinQuery convert(Query query, SaikuCube cube) {
		ThinQueryModel tqm = convert(query);
		return new ThinQuery(tqm, cube);
	}

	private static ThinQueryModel convert(Query query) {
		ThinQueryModel tqm = new ThinQueryModel();
		tqm.setAxes(convertAxes(query.getAxes()));
		ThinDetails td = convert(query.getDetails());
		tqm.setDetails(td);
		List<ThinCalculatedMeasure> cms = convert(query.getCalculatedMeasures());
		tqm.setCalculatedMeasures(cms);
		tqm.setVisualTotals(query.getDefaultVisualTotals());
		tqm.setVisualTotalsPattern(query.getDefaultVisualTotalsPattern());

		
//		extendQuerySet(tqm, null);
		return tqm;
	}

	private static List<ThinCalculatedMeasure> convert(List<CalculatedMeasure> qcms) {
		List<ThinCalculatedMeasure> tcms = new ArrayList<ThinCalculatedMeasure>();
		if (qcms != null && qcms.size() > 0) {
			for (CalculatedMeasure qcm : qcms) {
				Properties props = new Properties();
				props.putAll(qcm.getPropertyValueMap());
				ThinCalculatedMeasure tcm = new ThinCalculatedMeasure(
						qcm.getName(), 
						qcm.getUniqueName(), 
						qcm.getCaption(), 
						qcm.getFormula(),
						props);
				tcms.add(tcm);
			}
		}
		
		return tcms;
	}

	private static ThinDetails convert(QueryDetails details) {
		ThinDetails.Location location = ThinDetails.Location.valueOf(details.getLocation().toString());
		AxisLocation axis = AxisLocation.valueOf(details.getAxis().toString());
		List<ThinMeasure> measures = new ArrayList<ThinMeasure>();
		if (details.getLocation().equals(Location.BOTTOM))
		if (details != null && details.getMeasures().size() > 0) {
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

	private static Map<AxisLocation, ThinAxis> convertAxes(Map<Axis, QueryAxis> axes) {
		Map<ThinQueryModel.AxisLocation, ThinAxis> thinAxes = new HashMap<ThinQueryModel.AxisLocation, ThinAxis>();
		if (axes != null) {
			for (Axis axis : axes.keySet()) {
				if (axis != null) {
					ThinAxis ta = convertAxis(axes.get(axis));
					thinAxes.put(ta.getLocation(), ta);
				}
			}
		}
		return thinAxes;
	}

	private static ThinAxis convertAxis(QueryAxis queryAxis) {
		AxisLocation loc = getLocation(queryAxis);
		ThinAxis ta = new ThinAxis(loc, convertHierarchies(queryAxis.getQueryHierarchies()), queryAxis.isNonEmpty());
		extendSortableQuerySet(ta, queryAxis);
		return ta;
	}
	
	private static Map<String, ThinHierarchy> convertHierarchies(List<QueryHierarchy> queryHierarchies) {
		Map<String, ThinHierarchy> hs = new HashMap<String, ThinHierarchy>();
		if (queryHierarchies != null) {
			for (QueryHierarchy qh : queryHierarchies) {
				ThinHierarchy th = convertHierarchy(qh);
				hs.put(qh.getName(), th);
			}
		}
		return hs;
	}

	private static ThinHierarchy convertHierarchy(QueryHierarchy qh) {
		ThinHierarchy th = new ThinHierarchy(qh.getName(), qh.getUniqueName(), qh.getCaption(), convertLevels(qh.getActiveQueryLevels()));
		extendSortableQuerySet(th, qh);
		return th;
	}

	private static Map<String, ThinLevel> convertLevels(List<QueryLevel> levels) {
		Map<String, ThinLevel> tl = new HashMap<String, ThinLevel>();
		if (levels != null) {
			for (QueryLevel ql : levels) {
				ThinLevel l = convertLevel(ql);
				tl.put(ql.getName(), l);
			}
		}
		return tl;
	}

	private static ThinLevel convertLevel(QueryLevel ql) {
		List<ThinMember> inclusions = convertMembers(ql.getInclusions());
		List<ThinMember> exclusions = convertMembers(ql.getExclusions());
		ThinLevel l = new ThinLevel(ql.getName(), ql.getUniqueName(), ql.getCaption(), inclusions, exclusions);
		extendQuerySet(l, ql);
		return l;
	}

	private static List<ThinMember> convertMembers(List<Member> members) {
		List<ThinMember> ms = new ArrayList<ThinMember>();
		if (members != null) {
			for (Member m : members) {
				ThinMember tm = new ThinMember(m.getName(), m.getUniqueName(), m.getCaption());
				ms.add(tm);
			}
		}
		return ms;
	}

	private static AxisLocation getLocation(QueryAxis axis) {
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

	private static void extendQuerySet(ThinQuerySet ts, IQuerySet qs) {
		if (StringUtils.isNotBlank(qs.getMdxSetExpression())) {
			ts.setMdx(qs.getMdxSetExpression());
		}
		if (qs.getFilters() != null && qs.getFilters().size() > 0) {
			List<ThinFilter> filters = convertFilters(qs.getFilters());
			ts.getFilters().addAll(filters);
		}
		
	}
	
	private static List<ThinFilter> convertFilters(List<IFilterFunction> filters) {
		List<ThinFilter> tfs = new ArrayList<ThinFilter>();
		for (IFilterFunction f : filters) {
			if (f instanceof NameFilter) {
				NameFilter nf = (NameFilter) f;
				List<String> expressions = nf.getFilterExpression();
				ThinFilter tf = new ThinFilter(FilterFlavour.Name, FilterOperator.EQUALS, FilterFunction.Filter, expressions);
				tfs.add(tf);
			}
			if (f instanceof NameLikeFilter) {
				NameLikeFilter nf = (NameLikeFilter) f;
				List<String> expressions = nf.getFilterExpression();
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
				expressions.add(nf.getFilterExpression());
				FilterFunction type = FilterFunction.valueOf(nf.getFunctionType().toString());
				ThinFilter tf = new ThinFilter(FilterFlavour.N, null, type, expressions);
				tfs.add(tf);
			}
		}
		return tfs;
	}

	private static void extendSortableQuerySet(ThinSortableQuerySet ts, ISortableQuerySet qs) {
		extendQuerySet(ts, qs);
		if (qs.getHierarchizeMode() != null) {
			ts.setHierarchizeMode(HierarchizeMode.valueOf(qs.getHierarchizeMode().toString()));
		}
		if (qs.getSortOrder() != null) {
			ts.sort(SortOrder.valueOf(qs.getSortOrder().toString()), qs.getSortEvaluationLiteral());
		}
		
		
	}
	

}

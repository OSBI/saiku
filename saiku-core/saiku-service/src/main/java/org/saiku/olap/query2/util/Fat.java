package org.saiku.olap.query2.util;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.olap4j.Axis;
import org.olap4j.OlapException;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Measure;
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
import org.saiku.olap.query2.common.TqUtil;
import org.saiku.olap.query2.filter.ThinFilter;
import org.saiku.query.IQuerySet;
import org.saiku.query.ISortableQuerySet;
import org.saiku.query.Query;
import org.saiku.query.QueryAxis;
import org.saiku.query.QueryDetails.Location;
import org.saiku.query.QueryHierarchy;
import org.saiku.query.QueryLevel;
import org.saiku.query.mdx.GenericFilter;
import org.saiku.query.mdx.IFilterFunction;
import org.saiku.query.mdx.IFilterFunction.MdxFunctionType;
import org.saiku.query.mdx.NFilter;
import org.saiku.query.mdx.NameFilter;
import org.saiku.query.mdx.NameLikeFilter;
import org.saiku.query.metadata.CalculatedMeasure;

public class Fat {
	
	public static Query convert(ThinQuery tq, Cube cube) throws SQLException {
		
		Query q = new Query(tq.getName(), cube);
		if (tq.getQueryModel() == null)
			return q;

		ThinQueryModel model = tq.getQueryModel();
		convertAxes(q, tq.getQueryModel().getAxes(), tq);
		convertCalculatedMeasures(q, model.getCalculatedMeasures());
		convertDetails(q, model.getDetails());
		q.setVisualTotals(model.isVisualTotals());
		q.setVisualTotalsPattern(model.getVisualTotalsPattern());
		return q;
	}

	private static void convertCalculatedMeasures(Query q, List<ThinCalculatedMeasure> thinCms) {
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

	private static void convertDetails(Query query, ThinDetails details) {
		Location loc = Location.valueOf(details.getLocation().toString());
		query.getDetails().setLocation(loc);
		Axis ax = getLocation(details.getAxis());
		query.getDetails().setAxis(ax);
		
		if (details != null && details.getMeasures().size() > 0) {
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

	private static void convertAxes(Query q, Map<AxisLocation, ThinAxis> axes, ThinQuery tq) throws OlapException {
		if (axes != null) {
			for (AxisLocation axis : sortAxes(axes.keySet())) {
				if (axis != null) {
					convertAxis(q, axes.get(axis), tq);
				}
			}
		}
	}
	
	private static List<AxisLocation> sortAxes(Set<AxisLocation> axes) {
		List<AxisLocation> ax = new ArrayList<AxisLocation>();
		for (AxisLocation a : AxisLocation.values()) {
			if (axes.contains(a)){
				ax.add(a);
			}
		}
		return ax;
	}
	
	

	private static void convertAxis(Query query, ThinAxis thinAxis, ThinQuery tq) throws OlapException {
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
		extendSortableQuerySet(query, qaxis, thinAxis);
	}
	
	private static void convertHierarchy(QueryHierarchy qh, ThinHierarchy th, ThinQuery tq) throws OlapException {
		for (ThinLevel tl : th.getLevels().values()) {
			QueryLevel ql = qh.includeLevel(tl.getName());
			
			if (tl.getSelection() != null) {
				String parameter = tl.getSelection().getParameterName();
				List<String> parameterValues = null;
				if (StringUtils.isNotBlank(parameter)) {
					String value = tq.getParameter(parameter);
					parameterValues = TqUtil.splitParameterValues(value);
				}
				switch(tl.getSelection().getType()) {
				case INCLUSION:
					if (parameterValues != null) {
						for (String m : parameterValues) {
							qh.includeMember(m);
						}

					} else {
						for (ThinMember tm : tl.getSelection().getMembers()) {
							qh.includeMember(tm.getUniqueName());
						}
					}
					break;

				case EXCLUSION:
					if (parameterValues != null) {
						for (String m : parameterValues) {
							qh.excludeMember(m);
						}

					} else {
						for (ThinMember tm : tl.getSelection().getMembers()) {
							qh.excludeMember(tm.getUniqueName());
						}
					}
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


	private static Axis getLocation(AxisLocation axis) {
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

	private static void extendQuerySet(Query q, IQuerySet qs, ThinQuerySet ts) {
		qs.setMdxSetExpression(ts.getMdx());
		
		if (ts.getFilters() != null && ts.getFilters().size() > 0) {
			List<IFilterFunction> filters = convertFilters(q, ts.getFilters());
			qs.getFilters().addAll(filters);
		}
		
	}
	
	private static List<IFilterFunction> convertFilters(Query q, List<ThinFilter> filters) {
		List<IFilterFunction> qfs = new ArrayList<IFilterFunction>();
		for (ThinFilter f : filters) {
			switch(f.getFlavour()) {
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
					if (nexp != null && nexp.size() > 1) {
						MdxFunctionType mf = MdxFunctionType.valueOf(f.getFunction().toString());
						int n = Integer.parseInt(nexp.get(0));
						String expression = nexp.get(1);
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

	private static void extendSortableQuerySet(Query q, ISortableQuerySet qs, ThinSortableQuerySet ts) {
		extendQuerySet(q, qs, ts);
		if (ts.getHierarchizeMode() != null) {
			qs.setHierarchizeMode(org.saiku.query.ISortableQuerySet.HierarchizeMode.valueOf(ts.getHierarchizeMode().toString()));
		}
		if (ts.getSortOrder() != null) {
			qs.sort(org.saiku.query.SortOrder.valueOf(ts.getSortOrder().toString()), ts.getSortEvaluationLiteral());
		}
		
		
	}
	

}

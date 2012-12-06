package org.saiku.olap.query2.common;

import java.util.List;

import org.saiku.olap.query2.filter.ThinFilter;

public interface ThinQuerySet {

		public String getName();
		
		public void setMdx(String mdxSetExpression);
		
		public String getMdx();
		
		public void addFilter(ThinFilter filter);
		
		public void setFilter(int index, ThinFilter filter);
		
		public List<ThinFilter> getFilters();
		
		public void clearFilters();
}

package org.saiku.olap.util;

import java.util.ArrayList;
import java.util.List;

import org.olap4j.metadata.Dimension;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.query.QueryDimension;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;

public class ObjectUtil {
	

	public static SaikuDimension convert(Dimension dim) {
		SaikuDimension sDim = new SaikuDimension(dim.getName(), dim.getUniqueName(), dim.getCaption(), convertHierarchies(dim.getHierarchies()));
		return sDim;
	}
	
	public static SaikuDimension convert(QueryDimension dim) {
		return convert(dim.getDimension());
	}
	
	public static List<SaikuDimension> convertDimensions(List<QueryDimension> dims) {
		List<SaikuDimension> dimList = new ArrayList<SaikuDimension>();
		for (QueryDimension d : dims) {
			dimList.add(convert(d));
		}
		return dimList;
	}
	
	public static List<SaikuHierarchy> convertHierarchies(List<Hierarchy> hierarchies) {
		List<SaikuHierarchy> hierarchyList= new ArrayList<SaikuHierarchy>();
		for (Hierarchy h : hierarchies) {
			hierarchyList.add(convert(h));
		}
		return hierarchyList;
		
	}
	
	public static SaikuHierarchy convert(Hierarchy hierarchy) {
		return new SaikuHierarchy(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimension().getUniqueName());
	}
	
	
	
}

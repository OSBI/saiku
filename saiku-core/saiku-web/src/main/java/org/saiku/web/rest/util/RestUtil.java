package org.saiku.web.rest.util;

import java.util.ArrayList;
import java.util.List;

import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;

public class RestUtil {

	public static DimensionRestPojo convert(SaikuDimension dim) {
		DimensionRestPojo sDim = new DimensionRestPojo(dim.getName(), dim.getUniqueName(), dim.getCaption());
		return sDim;
	}
	
	public static List<DimensionRestPojo> convertDimensions(List<SaikuDimension> dims) {
		List<DimensionRestPojo> dimList = new ArrayList<DimensionRestPojo>();
		for (SaikuDimension d : dims) {
			dimList.add(convert(d));
		}
		return dimList;
	}
	
	public static List<HierarchyRestPojo> convertHierarchies(List<SaikuHierarchy> hierarchies) {
		List<HierarchyRestPojo> dimList = new ArrayList<HierarchyRestPojo>();
		for (SaikuHierarchy h : hierarchies) {
			dimList.add(convert(h));
		}
		return dimList;
	}

	public static HierarchyRestPojo convert(SaikuHierarchy hierarchy) {
		return new HierarchyRestPojo(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimensionUniqueName());
	}
}

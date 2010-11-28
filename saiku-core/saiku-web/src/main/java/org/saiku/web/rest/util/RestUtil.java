package org.saiku.web.rest.util;

import java.util.ArrayList;
import java.util.List;

import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.MemberRestPojo;

public class RestUtil {

	public static DimensionRestPojo convert(SaikuDimension dim) {
		DimensionRestPojo sDim = new DimensionRestPojo(dim.getName(), dim.getUniqueName(), dim.getCaption(), convertHierarchies(dim.getHierarchies()));
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
	
	public static List<SaikuHierarchy> convertToSaikuHierarchies(List<HierarchyRestPojo> hierarchies) {
		List<SaikuHierarchy> dimList = new ArrayList<SaikuHierarchy>();
		for (HierarchyRestPojo h : hierarchies) {
			dimList.add(convert(h));
		}
		return dimList;
	}

	public static SaikuHierarchy convert(HierarchyRestPojo hierarchy) {
		return new SaikuHierarchy(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimensionUniqueName());
	}

	
	public static List<SaikuMember> convertToSaikuMembers(List<MemberRestPojo> members) {
		List<SaikuMember> memberList = new ArrayList<SaikuMember>();
		for (MemberRestPojo m : members) {
			memberList.add(convert(h));
		}
		return memberList;
	}

	public static SaikuMember convert(MemberRestPojo member) {
		return new SaikuMember(member.getName(), member.getUniqueName(), member.getCaption(), hierarchy.getDimensionUniqueName());
	}

}

package org.saiku.web.rest.util;

import java.util.ArrayList;
import java.util.List;

import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.LevelRestPojo;
import org.saiku.web.rest.objects.MemberRestPojo;

public class RestUtil {

	public static DimensionRestPojo convert(SaikuDimension dim) {
		DimensionRestPojo sDim = new DimensionRestPojo(dim.getName(), dim.getUniqueName(), dim.getCaption(), convertHierarchies(dim.getHierarchies()));
		return sDim;
	}
	
	public static RestList<DimensionRestPojo> convertDimensions(List<SaikuDimension> dims) {
		RestList<DimensionRestPojo> dimList = new RestList<DimensionRestPojo>();
		for (SaikuDimension d : dims) {
			dimList.add(convert(d));
		}
		return dimList;
	}
	
	public static RestList<HierarchyRestPojo> convertHierarchies(List<SaikuHierarchy> hierarchies) {
		RestList<HierarchyRestPojo> dimList = new RestList<HierarchyRestPojo>();
		for (SaikuHierarchy h : hierarchies) {
			dimList.add(convert(h));
		}
		return dimList;
	}

	public static HierarchyRestPojo convert(SaikuHierarchy hierarchy) {
		return new HierarchyRestPojo(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimensionUniqueName(), convertLevels(hierarchy.getLevels()));
	}
	
	public static List<SaikuHierarchy> convertToSaikuHierarchies(List<HierarchyRestPojo> hierarchies) {
		List<SaikuHierarchy> dimList = new ArrayList<SaikuHierarchy>();
		for (HierarchyRestPojo h : hierarchies) {
			dimList.add(convert(h));
		}
		return dimList;
	}

	public static SaikuLevel convert(LevelRestPojo level) {
		return new SaikuLevel(level.getName(), level.getUniqueName(), level.getCaption(), level.getHierarchyUniqueName(), convertToSaikuMembers(level.getMembers()));
	}

	public static RestList<LevelRestPojo> convertLevels(List<SaikuLevel> levels) {
		RestList<LevelRestPojo> levelList = new RestList<LevelRestPojo>();
		for (SaikuLevel l : levels) {
			levelList.add(convert(l));
		}
		return levelList;
	}

	public static LevelRestPojo convert(SaikuLevel level) {
		return new LevelRestPojo(level.getName(), level.getUniqueName(), level.getCaption(), level.getHierarchyUniqueName(), convertMembers(level.getMembers()));
	}
	
	public static RestList<MemberRestPojo> convertMembers(List<SaikuMember> members) {
		RestList<MemberRestPojo> memberList = new RestList<MemberRestPojo>();
		for (SaikuMember m : members) {
			memberList.add(convert(m));
		}
		return memberList;
	}

	public static MemberRestPojo convert(SaikuMember m) {
		MemberRestPojo member = new MemberRestPojo(m.getName(), m.getUniqueName(), m.getCaption(), m.getDimensionUniqueName());
		return member;
	}
	
	public static SaikuHierarchy convert(HierarchyRestPojo hierarchy) {
		return new SaikuHierarchy(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimensionUniqueName(), hierarchy.getSaikuHierachyList());
	}
	
	public static List<SaikuMember> convertToSaikuMembers(List<MemberRestPojo> members) {
		List<SaikuMember> memberList = new ArrayList<SaikuMember>();
		for (MemberRestPojo m : members) {
			memberList.add(convert(m));
		}
		return memberList;
	}

	public static SaikuMember convert(MemberRestPojo member) {
		return new SaikuMember(member.getName(), member.getUniqueName(), member.getCaption(), member.getDimensionUniqueName());
	}

}

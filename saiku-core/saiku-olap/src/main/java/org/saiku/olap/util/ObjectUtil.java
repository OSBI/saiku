package org.saiku.olap.util;

import java.util.ArrayList;
import java.util.List;

import org.olap4j.metadata.Dimension;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
import org.olap4j.query.QueryDimension;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;

public class ObjectUtil {


	public static SaikuDimension convert(Dimension dim) {
		SaikuDimension sDim = new SaikuDimension(dim.getName(), dim.getUniqueName(), dim.getCaption(), convertHierarchies(dim.getHierarchies()));
		return sDim;
	}

	public static SaikuDimension convert(QueryDimension dim) {
		return convert(dim.getDimension());
	}

	public static List<SaikuDimension> convertQueryDimensions(List<QueryDimension> dims) {
		List<SaikuDimension> dimList = new ArrayList<SaikuDimension>();
		for (QueryDimension d : dims) {
			dimList.add(convert(d));
		}
		return dimList;
	}
	
	public static List<SaikuDimension> convertDimensions(List<Dimension> dims) {
		List<SaikuDimension> dimList = new ArrayList<SaikuDimension>();
		for (Dimension d : dims) {
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
		return new SaikuHierarchy(hierarchy.getName(), hierarchy.getUniqueName(), hierarchy.getCaption(), hierarchy.getDimension().getUniqueName(), convertLevels(hierarchy.getLevels()));
	}

	public static List<SaikuLevel> convertLevels(List<Level> levels) {
		List<SaikuLevel> levelList= new ArrayList<SaikuLevel>();
		for (Level l : levels) {
			levelList.add(convert(l));
		}
		return levelList;

	}

	public static SaikuLevel convert(Level level) {
		try {
			List<SaikuMember> members = convertMembers(level.getMembers());
			return new SaikuLevel(level.getName(), level.getUniqueName(), level.getCaption(), level.getHierarchy().getUniqueName(),members);
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public static List<SaikuMember> convertMembers(List<Member> members) {
		List<SaikuMember> memberList= new ArrayList<SaikuMember>();
		for (Member l : members) {
			memberList.add(convert(l));
		}
		return memberList;

	}

	public static SaikuMember convert(Member m) {
		return new SaikuMember(m.getName(), m.getUniqueName(), m.getCaption(), m.getDimension().getUniqueName());
	}

}

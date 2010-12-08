package org.saiku.web.rest.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.dto.resultset.DataCell;
import org.saiku.olap.dto.resultset.MemberCell;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.LevelRestPojo;
import org.saiku.web.rest.objects.MemberRestPojo;
import org.saiku.web.rest.objects.resultset.Cell;

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
	
	public static RestList<Cell[]> convert(CellDataSet cellSet) {
		AbstractBaseCell[][] body = cellSet.getCellSetBody();
		AbstractBaseCell[][] headers = cellSet.getCellSetHeaders();
		
		RestList<Cell[]> rows = new RestList<Cell[]>();
		
		for (AbstractBaseCell header[] : headers) {
			rows.add(convert(header));
		}
		
		for (AbstractBaseCell row[] : body) {
			rows.add(convert(row));
		}
		return rows;
		
	}
	
	public static Cell[] convert(AbstractBaseCell[] acells) {
		Cell[]  cells = new Cell[acells.length];
		for (int i = 0; i < acells.length; i++) {
			cells[i] = convert(acells[i]);
		}
		return cells;
	}
	
	public static Cell convert(AbstractBaseCell acell) {
		if (acell != null) {
			if (acell instanceof DataCell) {
				DataCell dcell = (DataCell) acell;
				Properties metaprops = new Properties();
				metaprops.put("color", "" + dcell.getColorValue());
				RestList<Integer> coordinates = new RestList<Integer>();
				for (Integer number : dcell.getCoordinates()) {
					coordinates.add(number);
				}
				metaprops.put("coordinates", coordinates);
				metaprops.put("formattedValue", "" + dcell.getFormattedValue());
				metaprops.put("rawValue", "" + dcell.getRawValue());
				metaprops.put("rawNumber", "" + dcell.getRawNumber());
				
				Properties props = new Properties();
				props.putAll(dcell.getProperties());
				
				return new Cell(dcell.getFormattedValue(),metaprops,props, Cell.Type.DATA_CELL);
			}
			if (acell instanceof MemberCell) {
				MemberCell mcell = (MemberCell) acell;
				Properties metaprops = new Properties();
				metaprops.put("children", "" + mcell.getChildMemberCount());
				metaprops.put("uniqueName", "" + mcell.getUniqueName());
				metaprops.put("formattedValue", "" +  mcell.getFormattedValue());
				metaprops.put("rawValue", "" + mcell.getRawValue());
				
				Properties props = new Properties();
				props.putAll(mcell.getProperties());

				
				return new Cell("" + mcell.getFormattedValue(),metaprops,props, Cell.Type.HEADER);
			}

		
		}
		throw new RuntimeException("Cannot convert Cell. Type Mismatch!");

	}

}

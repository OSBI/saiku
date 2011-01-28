package org.saiku.web.rest.util;

import java.util.ArrayList;
import java.util.Properties;

import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.dto.resultset.DataCell;
import org.saiku.olap.dto.resultset.MemberCell;
import org.saiku.web.rest.objects.resultset.Cell;

public class RestUtil {
	
	public static ArrayList<Cell[]> convert(CellDataSet cellSet) {
		AbstractBaseCell[][] body = cellSet.getCellSetBody();
		AbstractBaseCell[][] headers = cellSet.getCellSetHeaders();
		
		ArrayList<Cell[]> rows = new ArrayList<Cell[]>();
		
		for (AbstractBaseCell header[] : headers) {
			rows.add(convert(header, Cell.Type.COLUMN_HEADER));
		}
		
		for (AbstractBaseCell row[] : body) {
			rows.add(convert(row, Cell.Type.ROW_HEADER));
		}
		return rows;
		
	}
	
	public static Cell[] convert(AbstractBaseCell[] acells, Cell.Type headertype) {
		Cell[]  cells = new Cell[acells.length];
		for (int i = 0; i < acells.length; i++) {
			cells[i] = convert(acells[i], headertype);
		}
		return cells;
	}
	
	public static Cell convert(AbstractBaseCell acell, Cell.Type headertype) {
		if (acell != null) {
			if (acell instanceof DataCell) {
				DataCell dcell = (DataCell) acell;
				Properties metaprops = new Properties();
				// metaprops.put("color", "" + dcell.getColorValue());
				ArrayList<Integer> coordinates = new ArrayList<Integer>();
				for (Integer number : dcell.getCoordinates()) {
					coordinates.add(number);
				}
				metaprops.put("coordinates", coordinates);
				metaprops.put("formattedValue", "" + dcell.getFormattedValue());
				// metaprops.put("rawValue", "" + dcell.getRawValue());
				metaprops.put("rawNumber", "" + dcell.getRawNumber());
				
				Properties props = new Properties();
				props.putAll(dcell.getProperties());
				
				// TODO no properties  (NULL) for now - 
				return new Cell(dcell.getFormattedValue(),metaprops, null, Cell.Type.DATA_CELL);
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

				// TODO no properties  (NULL) for now - 
				return new Cell("" + mcell.getFormattedValue(),metaprops, null , headertype);
			}

		
		}
		throw new RuntimeException("Cannot convert Cell. Type Mismatch!");

	}

}

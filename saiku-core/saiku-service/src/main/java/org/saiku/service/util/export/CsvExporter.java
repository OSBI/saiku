package org.saiku.service.util.export;

import java.util.ArrayList;
import java.util.List;

import org.olap4j.CellSet;
import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.formatter.CellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.service.util.exception.SaikuServiceException;

public class CsvExporter {
	
	public static byte[] exportCsv(CellSet cellSet) {
		return exportCsv(cellSet,";");
	}
	
	public static byte[] exportCsv(CellSet cellSet, String delimiter) {
		return exportCsv(cellSet, delimiter, new CellSetFormatter());
	}

	public static byte[] exportCsv(CellSet cellSet, String delimiter, ICellSetFormatter formatter) {
		CellDataSet table = OlapResultSetUtil.cellSet2Matrix(cellSet, formatter);
		return getCsv(table, delimiter);
	}

	private static byte[] getCsv(CellDataSet table, String delimiter) {
		if (table != null) {
			AbstractBaseCell[][] rowData = table.getCellSetBody();
			AbstractBaseCell[][] rowHeader = table.getCellSetHeaders();

			String[][] result = new String[rowHeader.length + rowData.length][];
			for (int x = 0; x<rowHeader.length;x++) {
				List<String> cols = new ArrayList<String>();
				for(int y = 0; y < rowHeader[x].length;y++) {
					cols.add(rowHeader[x][y].getFormattedValue()); 
				}
				result[x]= cols.toArray(new String[cols.size()]);

			}
			for (int x = 0; x<rowData.length ;x++) {
				int xTarget = rowHeader.length + x;
				List<String> cols = new ArrayList<String>();
				for(int y = 0; y < rowData[x].length;y++) {
					cols.add(rowData[x][y].getFormattedValue()); 
				}
				result[xTarget]= cols.toArray(new String[cols.size()]);

			}
			return export(result, delimiter);
		}
		return new byte[0];
	}

	private static byte[] export(String[][] resultSet, String delimiter) {
		try {
			String output = "";
			if(resultSet.length > 0){
				for(int i =  0; i < resultSet.length; i++){
					String[] vs = resultSet[i];
					for(int j = 0; j < vs.length ; j++){
						String value = vs[j];
						if(value == null || value == "null")  //$NON-NLS-1$
							value=""; //$NON-NLS-1$
						if ( j > 0) {
							output += delimiter + value;
						}
						else {
							output += value;
						}
					}
					output += "\r\n"; //$NON-NLS-1$
				}
				return output.getBytes("UTF8"); //$NON-NLS-1$
			}
		} catch (Throwable e) {
			throw new SaikuServiceException("Error creating csv export for query"); //$NON-NLS-1$
		}
		return new byte[0];
	}
}

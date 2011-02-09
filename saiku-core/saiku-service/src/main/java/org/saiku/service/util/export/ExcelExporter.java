package org.saiku.service.util.export;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import jxl.Workbook;
import jxl.format.Alignment;
import jxl.format.Border;
import jxl.format.BorderLineStyle;
import jxl.format.Colour;
import jxl.write.Label;
import jxl.write.Number;
import jxl.write.NumberFormat;
import jxl.write.WritableCellFormat;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;

import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.service.util.OlapUtil;
import org.saiku.service.util.exception.SaikuServiceException;

public class ExcelExporter {
	
	public static byte[] exportExcel(String queryId) {
		CellDataSet table = OlapUtil.getCellSet(queryId);
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
			return export(result);
		}
		return new byte[0];
	}

	private static byte[] export(String[][] resultSet) {
		WritableWorkbook  wb = null;
		try {
			ByteArrayOutputStream bout = new ByteArrayOutputStream();
			wb = Workbook.createWorkbook(bout);
			wb.setColourRGB(Colour.BLUE, 0xf0,0xf8,0xff);
			wb.setColourRGB(Colour.PALE_BLUE, 0xf9,0xf9,0xf9);
			WritableSheet sheet = wb.createSheet("Sheet", 0); //$NON-NLS-1$

			WritableCellFormat cf;

			if(resultSet.length > 0){
				boolean swapRows  = resultSet[0].length > 256 ? true : false;

				for(int i =  0; i < resultSet.length; i++){
					String[] vs = resultSet[i];
					for(int j = 0; j < vs.length ; j++){
						//cf = i == 0 ? hcs : j != 0 ? cs : (i % 2 != 0 ? hcs : rcs);
						cf = (i % 2 != 0 ? getEvenFormat() : getOddFormat());
						String value = vs[j];
						if(value == null || value == "null")  //$NON-NLS-1$
							value=""; //$NON-NLS-1$

						if(isDouble(value)){
							WritableCellFormat vf = getNumberFormat();
							vf.setBackground(cf.getBackgroundColour());
							Number number = new Number(swapRows ? i : j,swapRows ? j : i,Double.parseDouble(value),vf);
							sheet.addCell(number);
						}
						else{
							Label label = new Label(swapRows ? i : j,swapRows ? j : i,value,cf);
							sheet.addCell(label); 
						}
					}
				}



				wb.write();
				wb.close();
				byte[] output =bout.toByteArray();
				return output;

			}
		} catch (Throwable e) {
			throw new SaikuServiceException("Error creating excel export for query");
		}
		return new byte[0];
	}

	private static WritableCellFormat getOddFormat() throws WriteException {
		WritableCellFormat cs = new WritableCellFormat();
		cs.setBorder(Border.ALL, BorderLineStyle.THIN);
		cs.setBackground(Colour.PALE_BLUE);
		return cs;
	}
	private static WritableCellFormat getEvenFormat() throws WriteException {
		WritableCellFormat cs = new WritableCellFormat();
		cs.setBorder(Border.ALL, BorderLineStyle.THIN);


		cs.setBackground(Colour.BLUE);
		return cs;
	}
	private static WritableCellFormat getNumberFormat() throws WriteException {
		WritableCellFormat cs = new WritableCellFormat(new NumberFormat("###,###,###.###")); //$NON-NLS-1$
		cs.setBorder(Border.ALL, BorderLineStyle.THIN);
		cs.setAlignment(Alignment.RIGHT);
		return cs;
	}


	public static boolean isDouble(String obj){
		try{
			Double.parseDouble(obj);
		}catch(NumberFormatException e){
			return false;
		}
		return true;
	}
}

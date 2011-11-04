/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.olap.util;

import org.olap4j.CellSet;
import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.dto.resultset.Matrix;
import org.saiku.olap.util.formatter.HierarchicalCellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;

public class OlapResultSetUtil {

	public static CellDataSet cellSet2Matrix(final CellSet cellSet) {
		final ICellSetFormatter formatter = new HierarchicalCellSetFormatter();
		return cellSet2Matrix(cellSet,formatter);
	}
	
    public static CellDataSet cellSet2Matrix(final CellSet cellSet, ICellSetFormatter formatter) {
        if (cellSet == null) {
            return new CellDataSet(0,0);
        }
        final Matrix matrix = formatter.format(cellSet);
        final CellDataSet cds = new CellDataSet(matrix.getMatrixWidth(), matrix.getMatrixHeight());

        int z = 0;
        final AbstractBaseCell[][] bodyvalues = new AbstractBaseCell[matrix.getMatrixHeight() - matrix.getOffset()][matrix
                .getMatrixWidth()];
        for (int y = matrix.getOffset(); y < matrix.getMatrixHeight(); y++) {

            for (int x = 0; x < matrix.getMatrixWidth(); x++) {
                bodyvalues[z][x] = matrix.get(x, y);
            }
            z++;
        }

        cds.setCellSetBody(bodyvalues);

        final AbstractBaseCell[][] headervalues = new AbstractBaseCell[matrix.getOffset()][matrix.getMatrixWidth()];
        for (int y = 0; y < matrix.getOffset(); y++) {
            for (int x = 0; x < matrix.getMatrixWidth(); x++) {
                headervalues[y][x] = matrix.get(x, y);
            }
        }
        cds.setCellSetHeaders(headervalues);
        cds.setOffset(matrix.getOffset());
        return cds;

    }

}

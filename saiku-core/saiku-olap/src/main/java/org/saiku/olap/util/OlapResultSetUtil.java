package org.saiku.olap.util;

import org.olap4j.CellSet;
import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.dto.resultset.Matrix;

public class OlapResultSetUtil {

    public static CellDataSet cellSet2Matrix(final CellSet cellSet) {
        if (cellSet == null) {
            return null;
        }
        final HierarchicalCellSetFormatter pcsf = new HierarchicalCellSetFormatter();

        final Matrix matrix = pcsf.format(cellSet);
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

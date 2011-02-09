package org.saiku.service.util;

import java.util.HashMap;
import java.util.Map;

import org.saiku.olap.dto.resultset.CellDataSet;

public class OlapUtil {
	
	
    private static Map<String, CellDataSet> cellSetMap = new HashMap<String, CellDataSet>();

    
    /**
     * storeCellSet stores a cellset generated from a query so we can manipulate it at a later date.
     * 
     * @param cellSet
     * @param queryId
     * 
     */
    public static void storeCellSet(final String queryId, final CellDataSet cellSet) {
        if (cellSetMap.containsKey(queryId)) {
            cellSetMap.remove(queryId);
        }
        cellSetMap.put(queryId, cellSet);
    }
    
    public static CellDataSet getCellSet(final String queryId) {
        return cellSetMap.get(queryId);

    }

    public static void deleteCellSet(final String queryId) {
        cellSetMap.remove(queryId);
    }

}

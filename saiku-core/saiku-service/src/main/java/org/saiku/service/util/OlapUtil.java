package org.saiku.service.util;

import java.util.HashMap;
import java.util.Map;

import org.olap4j.CellSet;

public class OlapUtil {
	
	
    private static Map<String, CellSet> cellSetMap = new HashMap<String, CellSet>();

    
    /**
     * storeCellSet stores a cellset generated from a query so we can manipulate it at a later date.
     * 
     * @param cellSet
     * @param queryId
     * 
     */
    public static void storeCellSet(final String queryId, final CellSet cellSet) {
        if (cellSetMap.containsKey(queryId)) {
            cellSetMap.remove(queryId);
        }
        cellSetMap.put(queryId, cellSet);
    }
    
    public static CellSet getCellSet(final String queryId) {
        return cellSetMap.get(queryId);

    }

    public static void deleteCellSet(final String queryId) {
        cellSetMap.remove(queryId);
    }

}

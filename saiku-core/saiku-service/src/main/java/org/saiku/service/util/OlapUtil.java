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

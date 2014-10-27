/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.service.util;

import org.jetbrains.annotations.NotNull;
import org.olap4j.CellSet;

import java.util.HashMap;
import java.util.Map;

/**
 * OlapUtil.
 */
class OlapUtil {

  private OlapUtil() {

  }

  @NotNull
  private static final Map<String, CellSet> CELLSETMAP = new HashMap<String, CellSet>();


  /**
   * storeCellSet stores a cellset generated from a query so we can manipulate it at a later date.
   *
   * @param cellSet
   * @param queryId
   */
  public static void storeCellSet(final String queryId, final CellSet cellSet) {
    if (CELLSETMAP.containsKey(queryId)) {
      CELLSETMAP.remove(queryId);
    }
    CELLSETMAP.put(queryId, cellSet);
  }

  public static CellSet getCellSet(final String queryId) {
    return CELLSETMAP.get(queryId);

  }

  public static void deleteCellSet(final String queryId) {
    CELLSETMAP.remove(queryId);
  }

}

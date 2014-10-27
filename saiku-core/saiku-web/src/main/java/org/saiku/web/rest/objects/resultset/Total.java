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

package org.saiku.web.rest.objects.resultset;

import org.saiku.service.olap.totals.TotalNode;
import org.saiku.service.olap.totals.aggregators.TotalAggregator;

/**
 * Total.
 */
public class Total {
  private final Cell[][] cells;
  private final String[] captions;
  private final int span;
  private final int width;

  public Total(TotalNode node) {
    this(node.getTotalGroups(), node.getMemberCaptions(), node.getSpan(), node.getWidth());
  }

  public Total(TotalAggregator[][] values, String[] captions, int span, int width) {
    if (values.length > 0) {
      this.cells = new Cell[values.length][values[0].length];
    } else {
      this.cells = new Cell[0][];
    }

    this.captions = captions;

    for (int i = 0; i < values.length; i++) {
      for (int j = 0; j < values[0].length; j++) {
        this.cells[i][j] = new Cell(values[i][j].getFormattedValue(), Cell.Type.DATA_CELL);
      }
    }
    this.span = span;
    this.width = width;
  }

  public Cell[][] getCells() {
    return cells;
  }

  public String[] getCaptions() {
    return captions;
  }

  public int getSpan() {
    return span;
  }

  public int getWidth() {
    return width;
  }
}

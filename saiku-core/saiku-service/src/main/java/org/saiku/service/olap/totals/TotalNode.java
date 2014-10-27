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
package org.saiku.service.olap.totals;

import org.saiku.service.olap.totals.aggregators.TotalAggregator;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.Cell;
import org.olap4j.metadata.Measure;

/**
 * TotalNode.
 */
public class TotalNode {
  @Nullable
  private final String[] captions;
  @NotNull
  private final TotalAggregator[][] totals;
  private final boolean showsTotals;
  private final int cellsAdded;
  private int span;
  private int width;

  public TotalNode(
      @Nullable String[] captions, Measure[] measures, @Nullable TotalAggregator aggregatorTemplate,
      @NotNull FormatList formatList,
      int count) {
    this.captions = captions;
    showsTotals = aggregatorTemplate != null;

    if (showsTotals) {
      cellsAdded = captions != null ? captions.length : 1;
      totals = new TotalAggregator[cellsAdded][count];

      for (int i = 0; i < totals.length; i++) {
        for (int j = 0; j < totals[0].length; j++) {
          totals[i][j] = aggregatorTemplate.newInstance(formatList.getValueFormat(j, i), measures[i]);
        }
      }
    } else {
      totals = new TotalAggregator[0][count];
      cellsAdded = 0;
    }
  }

  public void addData(int member, int index, @NotNull Cell cell) {
    totals[member][index].addData(cell);
  }

  public void setFormattedValue(int member, int index, String value) {
    totals[member][index].setFormattedValue(value);
  }

  public int getSpan() {
    return span;
  }

  public void setSpan() {
    this.span = 1;
  }

  void appendSpan(int append) {
    this.span += append;
  }

  public int getWidth() {
    return width;
  }

  public void setWidth(int width) {
    this.width = width;
  }

  void appendWidth(int append) {
    this.width += append;
  }

  public void appendChild(@NotNull TotalNode child) {
    appendSpan(child.getRenderedCount());
    appendWidth(child.width);
  }

  @Nullable
  public String[] getMemberCaptions() {
    return captions;
  }

  @NotNull
  public TotalAggregator[][] getTotalGroups() {
    return totals;
  }

  int getRenderedCount() {
    return span + cellsAdded;
  }
}

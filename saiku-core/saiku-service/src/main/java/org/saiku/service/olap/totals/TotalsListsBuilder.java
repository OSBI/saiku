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

import org.saiku.olap.util.SaikuProperties;
import org.saiku.service.olap.totals.aggregators.TotalAggregator;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.*;
import org.olap4j.metadata.Cube;
import org.olap4j.metadata.Measure;
import org.olap4j.metadata.Member;
import org.olap4j.metadata.Property;

import java.util.*;

import mondrian.util.Format;

/**
 * TotalsListsBuilder.
 */
public class TotalsListsBuilder implements FormatList {
  @NotNull
  private final Member[] memberBranch;
  @NotNull
  private final TotalNode[] totalBranch;
  private final TotalAggregator[] aggrTempl;
  private final int col;
  private final int row;
  @NotNull
  private final List<TotalNode>[] totalsLists;
  private final int measuresAt;
  @Nullable
  private final String[] measuresCaptions;
  @NotNull
  private final Measure[] measures;
  @NotNull
  private final Map<String, Integer> uniqueToSelected;
  @NotNull
  private final AxisInfo dataAxisInfo;
  @NotNull
  private final AxisInfo totalsAxisInfo;
  @NotNull
  private final CellSet cellSet;
  @NotNull
  private final Format[] valueFormats;


  public TotalsListsBuilder(@NotNull Measure[] selectedMeasures, TotalAggregator[] aggrTempl, @NotNull CellSet cellSet,
                            @NotNull AxisInfo totalsAxisInfo, @NotNull AxisInfo dataAxisInfo) throws Exception {
    Cube cube;
    try {
      cube = cellSet.getMetaData().getCube();
    } catch (OlapException e) {
      throw new RuntimeException(e);
    }
    uniqueToSelected = new HashMap<String, Integer>();
    if (selectedMeasures.length > 0) {
      valueFormats = new Format[selectedMeasures.length];
      measures = selectedMeasures;
      for (int i = 0; i < valueFormats.length; i++) {
        valueFormats[i] = getMeasureFormat(selectedMeasures[i]);
        uniqueToSelected.put(selectedMeasures[i].getUniqueName(), i);
      }
    } else {
      Measure defaultMeasure = cube.getMeasures().get(0);
      if (cube.getDimensions().get("Measures") != null) {
        Member ms = cube.getDimensions().get("Measures").getDefaultHierarchy().getDefaultMember();
        if (ms instanceof Measure) {
          defaultMeasure = (Measure) ms;
        }
      }
      measures = new Measure[] { defaultMeasure };
      valueFormats = new Format[] { getMeasureFormat(defaultMeasure) };
    }
    this.cellSet = cellSet;
    this.dataAxisInfo = dataAxisInfo;
    this.totalsAxisInfo = totalsAxisInfo;
    final int maxDepth = dataAxisInfo.maxDepth + 1;
    boolean hasMeasuresOnDataAxis = false;
    int measuresAt = 0;
    int measuresMember = 0;
    final List<Member> members =
        dataAxisInfo.axis.getPositionCount() > 0 ? dataAxisInfo.axis.getPositions().get(0).getMembers()
                                                 : Collections.<Member>emptyList();
    for (; measuresMember < members.size(); measuresMember++) {
      Member m = members.get(measuresMember);
      if ("Measures".equals(m.getDimension().getName())) {
        hasMeasuresOnDataAxis = true;
        break;
      }
      measuresAt += dataAxisInfo.levels[measuresMember].size();
    }
    if (hasMeasuresOnDataAxis) {
      this.measuresAt = measuresAt;
      measuresCaptions = new String[selectedMeasures.length];
      for (int i = 0; i < measuresCaptions.length; i++) {
        measuresCaptions[i] = selectedMeasures[i].getCaption();
      }
    } else {
      this.measuresAt = Integer.MIN_VALUE;
      measuresCaptions = null;
    }

    totalBranch = new TotalNode[maxDepth];
    TotalNode rootNode =
        new TotalNode(measuresCaptions, measures, aggrTempl[0], this, totalsAxisInfo.fullPositions.size());
    col = Axis.ROWS.equals(dataAxisInfo.axis.getAxisOrdinal()) ? 1 : 0;
    row = col + 1 & 1;
    this.aggrTempl = aggrTempl;

    totalBranch[0] = rootNode;
    totalsLists = new List[maxDepth];
    for (int i = 0; i < totalsLists.length; i++) {
      totalsLists[i] = new ArrayList<TotalNode>();
    }
    totalsLists[0].add(rootNode);
    memberBranch = new Member[dataAxisInfo.maxDepth + 1];
  }

  private Format getMeasureFormat(@NotNull Measure m) {
    try {
      String formatString = (String) m.getPropertyValue(Property.StandardCellProperty.FORMAT_STRING);
      if (StringUtils.isBlank(formatString)) {
        Map<String, Property> props = m.getProperties().asMap();
        if (props.containsKey("FORMAT_STRING")) {
          formatString = (String) m.getPropertyValue(props.get("FORMAT_STRING"));
        } else if (props.containsKey("FORMAT_EXP")) {
          formatString = (String) m.getPropertyValue(props.get("FORMAT_EXP"));
        } else if (props.containsKey("FORMAT")) {
          formatString = (String) m.getPropertyValue(props.get("FORMAT"));
        }
      }
      return Format.get(formatString, SaikuProperties.LOCALE);
    } catch (OlapException e) {
      throw new RuntimeException(e);
    }
  }

  private void positionMember(final int depth, Member m, @NotNull final List<Integer> levels, final Member[] branch) {
    //@formatter:off
    for (int i = levels.size() - 1; i >= 0;) {
      //@formatter:on
      branch[depth + i] = m;
      i--;
      do {
        m = m != null ? m.getParentMember() : null;
      }
      while (i >= 0 && m != null && m.getDepth() != levels.get(i));
    }
  }

  private void traverse(List<Integer>[] levels, @NotNull List<TotalNode>[] totalLists) {
    int fullPosition = 0;
    final Member[] prevMemberBranch = new Member[memberBranch.length];

  nextpos:
    for (final Position p : dataAxisInfo.axis.getPositions()) {
      int depth = 1;
      int mI = 0;
      for (final Member m : p.getMembers()) {
        final int maxDepth = levels[mI].get(levels[mI].size() - 1);
        if (m.getDepth() < maxDepth) {
          continue nextpos;
        }
        positionMember(depth, m, levels[mI], memberBranch);
        depth += levels[mI].size();
        mI++;
      }

      int changedFrom = 1;
      while (changedFrom < memberBranch.length - 1 && memberBranch[changedFrom]
          .equals(prevMemberBranch[changedFrom])) {
        changedFrom++;
      }

      for (int i = totalBranch.length - 1; i >= changedFrom; i--) {
        if (totalBranch[i] != null) {
          totalBranch[i - 1].appendChild(totalBranch[i]);
        }
      }

      for (int i = changedFrom; i < totalBranch.length; i++) {
        String[] captions = measuresAt > i - 1 ? measuresCaptions : null;
        totalBranch[i] =
            new TotalNode(captions, measures, aggrTempl[i], this, totalsAxisInfo.fullPositions.size());
        totalLists[i].add(totalBranch[i]);
      }
      System.arraycopy(memberBranch, 0, prevMemberBranch, 0, prevMemberBranch.length);

      totalBranch[totalBranch.length - 1].setSpan();
      totalBranch[totalBranch.length - 1].setWidth(1);


      for (int t = 0; t < totalsAxisInfo.fullPositions.size(); t++) {
        Cell cell = getCellAt(fullPosition, t);
        for (int branchNode = 0; branchNode < totalBranch.length; branchNode++) {
          if (aggrTempl[branchNode] != null) {
            totalBranch[branchNode].addData(getMemberIndex(branchNode, fullPosition), t, cell);
          }
        }
      }
      fullPosition++;
    }
    for (int i = totalBranch.length - 1; i > 0; i--) {
      totalBranch[i - 1].appendChild(totalBranch[i]);
    }

    for (TotalNode n : totalLists[totalLists.length - 1]) {
      n.setWidth(0);
    }
  }

  @NotNull
  public List<TotalNode>[] buildTotalsLists() {
    traverse(dataAxisInfo.levels, totalsLists);
    return totalsLists;
  }

  private Cell getCellAt(int axisCoord, int perpAxisCoord) {
    final Position[] positions =
        new Position[] { dataAxisInfo.fullPositions.get(axisCoord), totalsAxisInfo.fullPositions.get(perpAxisCoord) };
    Cell cell = cellSet.getCell(positions[col], positions[row]);
    return cell;
  }

  private int getMemberIndex(int depth, int index) {
    if (depth - 1 < measuresAt) {
      Member m = dataAxisInfo.fullPositions.get(index).getMembers().get(dataAxisInfo.measuresMember);
      if (uniqueToSelected.containsKey(m.getUniqueName())) {
        return uniqueToSelected.get(m.getUniqueName());
      }
    }
    return 0;
  }

  public Format getValueFormat(int position, int member) {
    int formatIndex = 0;
    if (dataAxisInfo.measuresMember >= 0) {
      formatIndex = member;
    } else if (totalsAxisInfo.measuresMember >= 0) {
      Member m = totalsAxisInfo.fullPositions.get(position).getMembers().get(totalsAxisInfo.measuresMember);
      if (uniqueToSelected.containsKey(m.getUniqueName())) {
        formatIndex = uniqueToSelected.get(m.getUniqueName());
      }
    }
    return valueFormats[formatIndex];
  }

}

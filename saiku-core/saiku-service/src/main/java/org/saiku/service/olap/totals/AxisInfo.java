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

import org.jetbrains.annotations.NotNull;
import org.olap4j.CellSetAxis;
import org.olap4j.Position;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Member;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * AxisInfo.
 */
public class AxisInfo {
  public List<Integer>[] levels;
  public final List<String> uniqueLevelNames = new ArrayList<String>();
  public int maxDepth;
  public int measuresMember;
  public List<Position> fullPositions;
  public final CellSetAxis axis;

  public AxisInfo(@NotNull CellSetAxis axis) {
    this.axis = axis;
    calcAxisInfo(axis);
  }

  private void calcAxisInfo(@NotNull CellSetAxis axis) {
    calcAxisInfo(this, axis);
  }

  private static void calcAxisInfo(@NotNull AxisInfo axisInfo, @NotNull CellSetAxis axis) {
    final List<Hierarchy> hierarchies = axis.getAxisMetaData().getHierarchies();
    final int hCount = hierarchies.size();
    final List<Integer>[] levels = new List[hCount];
    final HashSet<Integer>[][] usedLevels = new HashSet[hCount][];
    final int[] maxDepth = new int[hCount];

    for (int i = 0; i < hCount; i++) {
      maxDepth[i] = -1;
      levels[i] = new ArrayList<Integer>();
      usedLevels[i] = new HashSet[hierarchies.get(i).getLevels().size()];
      for (int j = 0; j < usedLevels[i].length; j++) {
        usedLevels[i][j] = new HashSet<Integer>();
      }
    }
    axisInfo.measuresMember = Integer.MIN_VALUE;

    for (final Position p : axis.getPositions()) {
      int mI = 0;
      for (final Member m : p.getMembers()) {
        if ("Measures".equals(m.getDimension().getName())) {
          axisInfo.measuresMember = mI;
        }
        usedLevels[mI][m.getLevel().getDepth()].add(m.getDepth());
        mI++;
      }
    }

    for (int i = 0; i < usedLevels.length; i++) {
      for (int j = 0; j < usedLevels[i].length; j++) {
        if (usedLevels[i][j].size() > 0) {
          levels[i].add(j);
          axisInfo.uniqueLevelNames.add(hierarchies.get(i).getLevels().get(j).getUniqueName());
        }
      }
    }

    int maxAxisDepth = 0;
    for (int i = 0; i < hCount; i++) {
      maxAxisDepth += levels[i].size();
    }
    axisInfo.levels = levels;
    axisInfo.maxDepth = maxAxisDepth;
    findFullPositions(axisInfo, axis);
  }

  private static void findFullPositions(@NotNull AxisInfo axisInfo, @NotNull CellSetAxis axis) {
    axisInfo.fullPositions = new ArrayList<Position>(axis.getPositionCount());
    List<Integer>[] levels = axisInfo.levels;
  nextpos:
    for (final Position p : axis.getPositions()) {
      int mI = 0;
      for (final Member m : p.getMembers()) {
        final int maxDepth = levels[mI].get(levels[mI].size() - 1);
        if (m.getDepth() < maxDepth) {
          continue nextpos;
        }
        mI++;
      }
      axisInfo.fullPositions.add(p);
    }
  }
}

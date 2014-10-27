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
package org.saiku.olap.util.formatter;

import org.saiku.olap.dto.resultset.DataCell;
import org.saiku.olap.dto.resultset.Matrix;
import org.saiku.olap.dto.resultset.MemberCell;
import org.saiku.olap.util.SaikuProperties;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.Cell;
import org.olap4j.CellSet;
import org.olap4j.CellSetAxis;
import org.olap4j.Position;
import org.olap4j.impl.CoordinateIterator;
import org.olap4j.impl.Olap4jUtil;
import org.olap4j.metadata.Hierarchy;
import org.olap4j.metadata.Level;
import org.olap4j.metadata.Member;
import org.olap4j.metadata.Property;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.*;

/**
 * CellSetFormatter.
 */
public class CellSetFormatter implements ICellSetFormatter {
  private static final Logger LOG = LoggerFactory.getLogger(CellSetFormatter.class);

  /**
   * Description of an axis.
   */
  private static class AxisInfo {
    @NotNull
    final List<AxisOrdinalInfo> ordinalInfos;

    /**
     * Creates an AxisInfo.
     *
     * @param ordinalCount Number of hierarchies on this axis
     */
    AxisInfo(final int ordinalCount) {
      ordinalInfos = new ArrayList<AxisOrdinalInfo>(ordinalCount);
      for (int i = 0; i < ordinalCount; i++) {
        ordinalInfos.add(new AxisOrdinalInfo());
      }
    }

    /**
     * Returns the number of matrix columns required by this axis. The sum of the width of the hierarchies on this
     * axis.
     *
     * @return Width of axis
     */
    public int getWidth() {
      int width = 0;
      for (final AxisOrdinalInfo info : ordinalInfos) {
        width += info.getWidth();
      }
      return width;
    }
  }

  /**
   * Description of a particular hierarchy mapped to an axis.
   */
  private static class AxisOrdinalInfo {
    @NotNull
    private final List<Integer> depths = new ArrayList<Integer>();
    @NotNull
    private final Map<Integer, Level> depthLevel = new HashMap<Integer, Level>();

    public int getWidth() {
      return depths.size();
    }

    @NotNull
    public List<Integer> getDepths() {
      return depths;
    }

    public Level getLevel(Integer depth) {
      return depthLevel.get(depth);
    }

    public void addLevel(Integer depth, Level level) {
      depthLevel.put(depth, level);
    }
  }

  /**
   * Returns an iterator over cells in a result.
   */
  @NotNull
  private static Iterable<Cell> cellIter(@NotNull final int[] pageCoords, @NotNull final CellSet cellSet) {
    return new Iterable<Cell>() {
      @NotNull
      public Iterator<Cell> iterator() {
        final int[] axisDimensions = new int[cellSet.getAxes().size() - pageCoords.length];
        assert pageCoords.length <= axisDimensions.length;
        for (int i = 0; i < axisDimensions.length; i++) {
          final CellSetAxis axis = cellSet.getAxes().get(i);
          axisDimensions[i] = axis.getPositions().size();
        }
        final CoordinateIterator coordIter = new CoordinateIterator(axisDimensions, true);
        return new Iterator<Cell>() {
          public boolean hasNext() {
            return coordIter.hasNext();
          }

          public Cell next() {
            final int[] ints = coordIter.next();
            final AbstractList<Integer> intList = new AbstractList<Integer>() {
              @Override
              public Integer get(final int index) {
                return index < ints.length ? ints[index] : pageCoords[index - ints.length];
              }

              @Override
              public int size() {
                return pageCoords.length + ints.length;
              }
            };
            return cellSet.getCell(intList);
          }

          public void remove() {
            throw new UnsupportedOperationException();
          }
        };
      }
    };
  }

  private Matrix matrix;

  public Matrix format(@NotNull final CellSet cellSet) {
    // Compute how many rows are required to display the columns axis.
    final CellSetAxis columnsAxis;
    if (cellSet.getAxes().size() > 0) {
      columnsAxis = cellSet.getAxes().get(0);
    } else {
      columnsAxis = null;
    }
    final AxisInfo columnsAxisInfo = computeAxisInfo(columnsAxis);

    // Compute how many columns are required to display the rows axis.
    final CellSetAxis rowsAxis;
    if (cellSet.getAxes().size() > 1) {
      rowsAxis = cellSet.getAxes().get(1);
    } else {
      rowsAxis = null;
    }
    final AxisInfo rowsAxisInfo = computeAxisInfo(rowsAxis);

    if (cellSet.getAxes().size() > 2) {
      final int[] dimensions = new int[cellSet.getAxes().size() - 2];
      for (int i = 2; i < cellSet.getAxes().size(); i++) {
        final CellSetAxis cellSetAxis = cellSet.getAxes().get(i);
        dimensions[i - 2] = cellSetAxis.getPositions().size();
      }
      for (final int[] pageCoords : CoordinateIterator.iterate(dimensions)) {
        matrix = formatPage(cellSet, pageCoords, columnsAxis, columnsAxisInfo, rowsAxis, rowsAxisInfo);
      }
    } else {
      matrix = formatPage(cellSet, new int[] { }, columnsAxis, columnsAxisInfo, rowsAxis, rowsAxisInfo);
    }

    return matrix;
  }

  /**
   * Computes a description of an axis.
   *
   * @param axis Axis
   * @return Description of axis
   */
  @NotNull
  private AxisInfo computeAxisInfo(@Nullable final CellSetAxis axis) {
    if (axis == null) {
      return new AxisInfo(0);
    }
    final AxisInfo axisInfo = new AxisInfo(axis.getAxisMetaData().getHierarchies().size());
    int p = -1;
    for (final Position position : axis.getPositions()) {
      ++p;
      int k = -1;
      for (final Member member : position.getMembers()) {
        ++k;
        final AxisOrdinalInfo axisOrdinalInfo = axisInfo.ordinalInfos.get(k);
        if (!axisOrdinalInfo.getDepths().contains(member.getDepth())) {
          axisOrdinalInfo.getDepths().add(member.getDepth());
          axisOrdinalInfo.addLevel(member.getDepth(), member.getLevel());
          Collections.sort(axisOrdinalInfo.depths);
        }
      }
    }
    return axisInfo;
  }

  /**
   * Formats a two-dimensional page.
   *
   * @param cellSet         Cell set
   * @param pw              Print writer
   * @param pageCoords      Coordinates of page [page, chapter, section, ...]
   * @param columnsAxis     Columns axis
   * @param columnsAxisInfo Description of columns axis
   * @param rowsAxis        Rows axis
   * @param rowsAxisInfo    Description of rows axis
   */
  @NotNull
  private Matrix formatPage(@NotNull final CellSet cellSet, @NotNull final int[] pageCoords,
                            @Nullable final CellSetAxis columnsAxis,
                            @NotNull final AxisInfo columnsAxisInfo, @Nullable final CellSetAxis rowsAxis,
                            @NotNull final AxisInfo rowsAxisInfo) {

    // Figure out the dimensions of the blank rectangle in the top left
    // corner.
    final int yOffset = columnsAxisInfo.getWidth();
    final int xOffsset = rowsAxisInfo.getWidth();

    // Populate a string matrix
    final Matrix matrix = new Matrix(xOffsset + (columnsAxis == null ? 1 : columnsAxis.getPositions().size()),
        yOffset + (rowsAxis == null ? 1 : rowsAxis.getPositions().size()));

    // Populate corner
    List<Level> levels = new ArrayList<Level>();
    if (rowsAxis != null && rowsAxis.getPositions().size() > 0) {
      Position p = rowsAxis.getPositions().get(0);
      for (int m = 0; m < p.getMembers().size(); m++) {
        AxisOrdinalInfo a = rowsAxisInfo.ordinalInfos.get(m);
        for (Integer depth : a.getDepths()) {
          levels.add(a.getLevel(depth));
        }
      }
      for (int x = 0; x < xOffsset; x++) {
        Level xLevel = levels.get(x);
        String s = xLevel.getCaption();
        for (int y = 0; y < yOffset; y++) {
          final MemberCell memberInfo = new MemberCell(x > 0);
          if (y == yOffset - 1) {
            memberInfo.setRawValue(s);
            memberInfo.setFormattedValue(s);
            memberInfo.setProperty("__headertype", "row_header_header");
            memberInfo.setProperty("levelindex", "" + levels.indexOf(xLevel));
            memberInfo.setHierarchy(xLevel.getHierarchy().getUniqueName());
            memberInfo.setParentDimension(xLevel.getDimension().getName());
            memberInfo.setLevel(xLevel.getUniqueName());
          }
          matrix.set(x, y, memberInfo);
        }

      }
    }
    // Populate matrix with cells representing axes
    // noinspection SuspiciousNameCombination
    populateAxis(matrix, columnsAxis, columnsAxisInfo, true, xOffsset);
    populateAxis(matrix, rowsAxis, rowsAxisInfo, false, yOffset);

    // Populate cell values
    for (final Cell cell : cellIter(pageCoords, cellSet)) {
      final List<Integer> coordList = cell.getCoordinateList();
      int x = xOffsset;
      if (coordList.size() > 0) {
        x += coordList.get(0);
      }
      int y = yOffset;
      if (coordList.size() > 1) {
        y += coordList.get(1);
      }
      final DataCell cellInfo = new DataCell(true, coordList);
      cellInfo.setCoordinates(cell.getCoordinateList());

      if (cell.getValue() != null) {
        try {
          cellInfo.setRawNumber(cell.getDoubleValue());
        } catch (Exception e1) {
          LOG.error("could not get double value", e1);
        }
      }
      String cellValue = cell.getFormattedValue(); // First try to get a
      // formatted value

      if (cellValue == null || cellValue.equals("null")) { //$NON-NLS-1$
        cellValue = ""; //$NON-NLS-1$
      }
      if (cellValue.length() < 1) {
        final Object value = cell.getValue();
        if (value == null || value.equals("null")) { //$NON-NLS-1$
          cellValue = ""; //$NON-NLS-1$
        } else {
          try {
            // TODO this needs to become query / execution specific
            DecimalFormat myFormatter = new DecimalFormat(SaikuProperties.FORMATDEFAULTNUMBERFORMAT); //$NON-NLS-1$
            DecimalFormatSymbols dfs = new DecimalFormatSymbols(SaikuProperties.LOCALE);
            myFormatter.setDecimalFormatSymbols(dfs);
            String output = myFormatter.format(cell.getValue());
            cellValue = output;
          } catch (Exception e) {
            // TODO: handle exception
          }
        }
        // the raw value
      }

      // Format string is relevant for Excel export
      // xmla cells can throw an error on this
      try {

        String formatString = (String) cell.getPropertyValue(Property.StandardCellProperty.FORMAT_STRING);
        if (formatString != null && !formatString.startsWith("|")) {
          cellInfo.setFormatString(formatString);
        } else {
          formatString = formatString.substring(1, formatString.length());
          cellInfo.setFormatString(formatString.substring(0, formatString.indexOf("|")));
        }
      } catch (Exception e) {
        // we tried
      }

      Map<String, String> cellProperties = new HashMap<String, String>();
      String val = Olap4jUtil.parseFormattedCellValue(cellValue, cellProperties);
      if (!cellProperties.isEmpty()) {
        cellInfo.setProperties(cellProperties);
      }
      cellInfo.setFormattedValue(val);
      matrix.set(x, y, cellInfo);
    }
    return matrix;

  }

  /**
   * Populates cells in the matrix corresponding to a particular axis.
   *
   * @param matrix    Matrix to populate
   * @param axis      Axis
   * @param axisInfo  Description of axis
   * @param isColumns True if columns, false if rows
   * @param offset    Ordinal of first cell to populate in matrix
   */
  private void populateAxis(@NotNull final Matrix matrix, @Nullable final CellSetAxis axis,
                            @NotNull final AxisInfo axisInfo,
                            final boolean isColumns, final int offset) {

    if (axis == null) {
      return;
    }
    final Member[] prevMembers = new Member[axisInfo.getWidth()];
    final MemberCell[] prevMemberInfo = new MemberCell[axisInfo.getWidth()];
    final Member[] members = new Member[axisInfo.getWidth()];

    for (int i = 0; i < axis.getPositions().size(); i++) {
      final int x = offset + i;
      final Position position = axis.getPositions().get(i);
      int yOffset = 0;
      final List<Member> memberList = position.getMembers();
      final Map<Hierarchy, List<Integer>> lvls = new HashMap<Hierarchy, List<Integer>>();
      for (int j = 0; j < memberList.size(); j++) {
        Member member = memberList.get(j);
        final AxisOrdinalInfo ordinalInfo = axisInfo.ordinalInfos.get(j);
        List<Integer> depths = ordinalInfo.depths;
        Collections.sort(depths);
        lvls.put(member.getHierarchy(), depths);
        if (ordinalInfo.getDepths().size() > 0 && member.getDepth() < ordinalInfo.getDepths().get(0)) {
          break;
        }
        final int y = yOffset + ordinalInfo.depths.indexOf(member.getDepth());
        members[y] = member;
        yOffset += ordinalInfo.getWidth();
      }

      boolean expanded = false;
      boolean same = true;
      for (int y = 0; y < members.length; y++) {
        final MemberCell memberInfo = new MemberCell();
        final Member member = members[y];
        expanded = false;
        int index = memberList.indexOf(member);
        if (index >= 0) {
          final AxisOrdinalInfo ordinalInfo = axisInfo.ordinalInfos.get(index);
          int depth_i = ordinalInfo.getDepths().indexOf(member.getDepth());
          if (depth_i > 0) {
            expanded = true;
          }
        }
        memberInfo.setExpanded(expanded);
        same = same && i > 0 && Olap4jUtil.equal(prevMembers[y], member);


        if (member != null) {
          if (lvls != null && lvls.get(member.getHierarchy()) != null) {
            memberInfo
                .setProperty("levelindex",
                    "" + lvls.get(member.getHierarchy()).indexOf(member.getLevel().getDepth()));
          }
          if (x - 1 == offset) {
            memberInfo.setLastRow();
          }

          matrix.setOffset(offset);
          memberInfo.setRawValue(member.getUniqueName());
          memberInfo.setFormattedValue(member.getCaption()); // First try to get a formatted value
          memberInfo.setParentDimension(member.getDimension().getName());
          memberInfo.setHierarchy(member.getHierarchy().getUniqueName());
          memberInfo.setLevel(member.getLevel().getUniqueName());
          memberInfo.setUniquename(member.getUniqueName());
          //try {
          //memberInfo.setChildMemberCount(member.getChildMemberCount());
          //} catch (OlapException e) {
          //e.printStackTrace();
          //throw new RuntimeException(e);
          //}
          //NamedList<Property> values = member.getLevel().getProperties();
          //for(int j=0; j<values.size();j++){
          //String val;
          //try {
          //val = member.getPropertyFormattedValue(values.get(j));
          //} catch (OlapException e) {
          //e.printStackTrace();
          //throw new RuntimeException(e);
          //}
          //memberInfo.setProperty(values.get(j).getCaption(), val);
          //}

          //if (y > 0) {
          //for (int previ = y-1; previ >= 0;previ--) {
          //if(prevMembers[previ] != null) {
          //memberInfo.setRightOf(prevMemberInfo[previ]);
          //
          // memberInfo.setRightOfDimension(prevMembers[previ].getDimension().getName());
          //previ = -1;
          //}
          //}
          //}
          //
          //
          //if (member.getParentMember() != null)
          //
          // memberInfo.setParentMember(member.getParentMember().getUniqueName());

        } else {
          memberInfo.setRawValue(null);
          memberInfo.setFormattedValue(null);
          memberInfo.setParentDimension(null);
        }

        if (isColumns) {
          memberInfo.setRight();
          memberInfo.setSameAsPrev(same);
          if (member != null) {
            memberInfo.setParentDimension(member.getDimension().getName());
          }
          matrix.set(x, y, memberInfo);
        } else {
          memberInfo.setRight();
          memberInfo.setSameAsPrev(false);
          matrix.set(y, x, memberInfo);
        }
        int x_parent = isColumns ? x : y - 1;
        int y_parent = isColumns ? y - 1 : x;
        if (index >= 0) {
          final AxisOrdinalInfo ordinalInfo = axisInfo.ordinalInfos.get(index);
          int depth_i = ordinalInfo.getDepths().indexOf(member.getDepth());
          while (depth_i > 0) {
            depth_i--;
            int parentDepth = ordinalInfo.getDepths().get(depth_i);
            Member parent = member.getParentMember();
            while (parent != null && parent.getDepth() > parentDepth) {
              parent = parent.getParentMember();
            }
            final MemberCell pInfo = new MemberCell();
            if (parent != null) {
              pInfo.setRawValue(parent.getUniqueName());
              pInfo.setFormattedValue(parent.getCaption()); // First try to get a formatted value
              pInfo.setParentDimension(parent.getDimension().getName());
              pInfo.setHierarchy(parent.getHierarchy().getUniqueName());
              pInfo.setUniquename(parent.getUniqueName());
              pInfo.setLevel(parent.getLevel().getUniqueName());
            } else {
              pInfo.setRawValue("");
              pInfo.setFormattedValue(""); // First try to get a formatted value
              pInfo.setParentDimension(member.getDimension().getName());
              pInfo.setHierarchy(member.getHierarchy().getUniqueName());
              pInfo.setLevel(member.getLevel().getUniqueName());
              pInfo.setUniquename("");
            }
            matrix.set(x_parent, y_parent, pInfo);
            if (isColumns) {
              y_parent--;
            } else {
              x_parent--;
            }

          }
        }
        prevMembers[y] = member;
        prevMemberInfo[y] = memberInfo;
        members[y] = null;
      }
    }
  }
}

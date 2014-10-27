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
package org.saiku.service.util.export;

import org.saiku.olap.dto.resultset.AbstractBaseCell;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.dto.resultset.DataCell;
import org.saiku.olap.dto.resultset.MemberCell;
import org.saiku.olap.util.OlapResultSetUtil;
import org.saiku.olap.util.SaikuProperties;
import org.saiku.olap.util.formatter.CellSetFormatter;
import org.saiku.olap.util.formatter.ICellSetFormatter;
import org.saiku.service.util.KeyValue;
import org.saiku.service.util.exception.SaikuServiceException;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.CellSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * CsvExporter.
 */
public class CsvExporter {

  private CsvExporter() {

  }

  private static final Logger LOG = LoggerFactory.getLogger(CsvExporter.class);

  @NotNull
  public static byte[] exportCsv(CellSet cellSet) {
    return exportCsv(cellSet, SaikuProperties.WEBEXPORTCSVDELIMITER);
  }

  @NotNull
  private static byte[] exportCsv(CellSet cellSet, String delimiter) {
    return exportCsv(cellSet, SaikuProperties.WEBEXPORTCSVDELIMITER, SaikuProperties.WEBEXPORTCSVTEXTESCAPE,
        new CellSetFormatter());
  }

  @NotNull
  public static byte[] exportCsv(CellSet cellSet, String delimiter, String enclosing,
                                 @NotNull ICellSetFormatter formatter) {
    CellDataSet table = OlapResultSetUtil.cellSet2Matrix(cellSet, formatter);
    return getCsv(table, delimiter, enclosing);
  }

  @NotNull
  public static byte[] exportCsv(@NotNull ResultSet rs) {
    return getCsv(rs, SaikuProperties.WEBEXPORTCSVDELIMITER, SaikuProperties.WEBEXPORTCSVTEXTESCAPE, true, null);

  }

  @NotNull
  public static byte[] exportCsv(@NotNull ResultSet rs, String delimiter, String enclosing) {
    return getCsv(rs, delimiter, enclosing, true, null);
  }

  @NotNull
  public static byte[] exportCsv(@NotNull ResultSet rs, String delimiter, String enclosing, boolean printHeader,
                                 List<KeyValue<String, String>> additionalColumns) {
    return getCsv(rs, delimiter, enclosing, printHeader, additionalColumns);
  }

  @NotNull
  private static byte[] getCsv(@NotNull ResultSet rs, String delimiter, String enclosing, boolean printHeader,
                               @Nullable List<KeyValue<String, String>> additionalColumns) {
    Integer width = 0;

    Integer height = 0;
    StringBuilder sb = new StringBuilder();
    String addCols = null;
    ResultSetHelper rsch = new ResultSetHelper();
    try {
      while (rs.next()) {
        if (height == 0) {
          width = rs.getMetaData().getColumnCount();
          String header = null;
          if (additionalColumns != null) {
            for (KeyValue<String, String> kv : additionalColumns) {
              if (header == null) {
                header = "";
                addCols = "";
              } else {
                header += delimiter;
              }
              header += enclosing + kv.getKey() + enclosing;
              addCols += enclosing + kv.getValue() + enclosing + delimiter;
            }
          }
          for (int s = 0; s < width; s++) {
            if (header != null) {
              header += delimiter;
            } else {
              header = "";
            }
            header += enclosing + rs.getMetaData().getColumnName(s + 1) + enclosing;
          }
          if (header != null && printHeader) {
            header += "\r\n";
            sb.append(header);
          }
        }
        if (addCols != null) {
          sb.append(addCols);
        }
        for (int i = 0; i < width; i++) {
          int colType = rs.getMetaData().getColumnType(i + 1);
          String content = rsch.getValue(rs, colType, i + 1);
          if (content == null) {
            content = "";
          }
          if (i > 0) {
            sb.append(delimiter);
          }
          content = content.replace("\"", "\"\"");
          sb.append(enclosing).append(content).append(enclosing);
        }
        sb.append("\r\n");
        height++;
      }
      return sb.toString().getBytes(SaikuProperties.WEBEXPORTCSVTEXTENCODING); //$NON-NLS-1$
    } catch (Exception e) {
      LOG.error("Exception", e);
    }
    return new byte[0];
  }

  @NotNull
  private static byte[] getCsv(@Nullable CellDataSet table, String delimiter, String enclosing) {
    if (table != null) {
      AbstractBaseCell[][] rowData = table.getCellSetBody();
      AbstractBaseCell[][] rowHeader = table.getCellSetHeaders();


      boolean offset = rowHeader.length > 0;
      String[][] result = new String[(offset ? 1 : 0) + rowData.length][];
      if (offset) {
        List<String> cols = new ArrayList<String>();
        for (int x = 0; x < rowHeader[0].length; x++) {
          String col = null;
          for (int y = rowHeader.length - 1; y >= 0; y--) {
            String value = rowHeader[y][x].getFormattedValue();
            if (value == null || "null".equals(value)) {  //$NON-NLS-1$
              value = ""; //$NON-NLS-1$
            }
            if (col == null && StringUtils.isNotBlank(value)) {
              col = value;
            } else if (col != null && StringUtils.isNotBlank(value)) {
              col = value + "/" + col;
            }
          }
          cols.add(enclosing + col + enclosing);
        }
        result[0] = cols.toArray(new String[cols.size()]);
      }
      String[] lastKnownHeader = null;
      for (int x = 0; x < rowData.length; x++) {
        int xTarget = (offset ? 1 : 0) + x;
        if (lastKnownHeader == null) {
          lastKnownHeader = new String[rowData[x].length];
        }
        List<String> cols = new ArrayList<String>();
        for (int y = 0; y < rowData[x].length; y++) {
          String value = rowData[x][y].getFormattedValue();
          if (!SaikuProperties.WEBEXPORTCSVUSEFORMATTEDVALUE) {
            if (rowData[x][y] instanceof DataCell && ((DataCell) rowData[x][y]).getRawNumber() != null) {
              value = ((DataCell) rowData[x][y]).getRawNumber().toString();
            }
          }
          if (rowData[x][y] instanceof MemberCell && StringUtils.isNotBlank(value) && !"null".equals(value)) {
            lastKnownHeader[y] = value;
          } else if (rowData[x][y] instanceof MemberCell && (StringUtils.isBlank(value) || "null"
              .equals(value))) {
            value = StringUtils.isNotBlank(lastKnownHeader[y]) ? lastKnownHeader[y] : null;
          }

          if (value == null || "null".equals(value)) {
            value = "";
          }
          value = value.replace("\"", "\"\"");
          value = enclosing + value + enclosing;
          cols.add(value);
        }
        result[xTarget] = cols.toArray(new String[cols.size()]);

      }
      return export(result, delimiter);
    }
    return new byte[0];
  }

  @NotNull
  private static byte[] export(@NotNull String[][] resultSet, String delimiter) {
    try {
      String output = "";
      StringBuilder buf = new StringBuilder();
      if (resultSet.length > 0) {
        for (String[] vs : resultSet) {
          for (int j = 0; j < vs.length; j++) {
            String value = vs[j];

            if (j > 0) {
              buf.append(delimiter).append(value);
              //output += delimiter + value;
            } else {
              buf.append(value);
              //output += value;
            }
          }
          buf.append("\r\n");
          //output += "\r\n"; //$NON-NLS-1$
        }
        output = buf.toString();
        return output.getBytes(SaikuProperties.WEBEXPORTCSVTEXTENCODING); //$NON-NLS-1$
      }
    } catch (Throwable e) {
      throw new SaikuServiceException("Error creating csv export for query"); //$NON-NLS-1$
    }
    return new byte[0];
  }
}

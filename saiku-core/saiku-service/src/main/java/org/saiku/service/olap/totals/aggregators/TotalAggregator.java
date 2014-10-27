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
package org.saiku.service.olap.totals.aggregators;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.Cell;
import org.olap4j.metadata.Measure;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import mondrian.util.Format;

/**
 * TotalAggregator.
 */
public abstract class TotalAggregator {
  private static final Map<String, TotalAggregator> ALL;

  static {
    Map<String, TotalAggregator> tmp = new HashMap<String, TotalAggregator>();
    tmp.put("sum", new SumAggregator(null));
    tmp.put("max", new MaxAggregator(null));
    tmp.put("min", new MinAggregator(null));
    tmp.put("avg", new AvgAggregator(null));
    ALL = Collections.unmodifiableMap(tmp);
  }

  private String formattedValue;
  final Format format;

  TotalAggregator(Format format) {
    this.format = format;
  }

  public void addData(@NotNull Cell cell) {
    try {
      // FIXME - maybe we should try to do fetch the format here, but seems to cause some issues? infinite loop? make
      // sure we try this only once to override existing format?
      //if (format == null) {
      //String formatString = (String)
      // cell.getPropertyValue(Property.StandardCellProperty.FORMAT_STRING);
      //this.format = Format.get(formatString, SaikuProperties.LOCALE);
      //
      //}
      Object value = cell.getValue();
      if (value instanceof Number) {
        double doubleVal;

        doubleVal = cell.getDoubleValue();
        addData(doubleVal);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

  }

  protected abstract void addData(double data);

  @Nullable
  protected abstract Double getValue();

  @NotNull
  public abstract TotalAggregator newInstance(Format format, Measure measure);

  public String getFormattedValue() {
    if (formattedValue != null) {
      return formattedValue;
    } else {
      Double value = getValue();
      if (value != null) {
        return format.format(value);
      }
      return "";
    }
  }

  public void setFormattedValue(String formattedValue) {
    this.formattedValue = formattedValue;
  }

  @NotNull
  public TotalAggregator newInstance() {
    return newInstance();
  }

  public static TotalAggregator newInstanceByFunctionName(final String functionName) {
    return ALL.get(functionName);
  }
}

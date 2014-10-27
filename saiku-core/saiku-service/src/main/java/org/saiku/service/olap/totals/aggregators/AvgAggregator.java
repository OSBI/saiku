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
import org.olap4j.OlapException;
import org.olap4j.metadata.Datatype;
import org.olap4j.metadata.Measure;
import org.olap4j.metadata.Property;

import java.util.Set;

import mondrian.util.Format;

/**
 * AvgAggregator.
 */
public class AvgAggregator extends TotalAggregator {
  @Nullable
  private static final Property DRILLTHROUGH_COUNT = new Property() {

    @Nullable
    public String getCaption() {
      return null;
    }

    @Nullable
    public String getDescription() {
      return null;
    }

    @NotNull
    public String getName() {
      return "DRILLTHROUGH_COUNT";
    }

    @Nullable
    public String getUniqueName() {
      return null;
    }

    public boolean isVisible() {
      return false;
    }

    @Nullable
    public ContentType getContentType() {
      return null;
    }

    @Nullable
    public Datatype getDatatype() {
      return null;
    }

    @Nullable
    public Set<TypeFlag> getType() {
      return null;
    }

  };

  AvgAggregator(Format format) {
    super(format);
  }

  private double accumulator = 0.0;
  private long count = 0;

  public void addData(@NotNull Cell cell) {
    Object value = cell.getValue();
    if (value instanceof Number) {
      Integer count = (Integer) cell.getPropertyValue(DRILLTHROUGH_COUNT);
      double doubleVal;
      try {
        doubleVal = cell.getDoubleValue();
      } catch (OlapException e) {
        throw new RuntimeException(e);
      }
      if (count.longValue() > -1) {
        this.count += count.longValue();
        accumulator += doubleVal * count.doubleValue();
      } else {
        this.count++;
        accumulator += doubleVal;
      }

    }
  }

  @Override
  public void addData(double data) {
  }


  @Nullable
  @Override
  public Double getValue() {
    if (count > 0) {
      return accumulator / count;
    }
    return null;
  }

  @NotNull
  @Override
  public TotalAggregator newInstance(Format format, Measure measure) {
    return new AvgAggregator(format);
  }

}

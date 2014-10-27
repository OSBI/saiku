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
import org.olap4j.metadata.Measure;

import mondrian.util.Format;

/**
 * MinAggregator.
 */
public class MinAggregator extends TotalAggregator {

  MinAggregator(Format format) {
    super(format);
  }

  @Nullable
  private
  Double min = null;

  @Override
  public void addData(double data) {
    if (min == null) {
      min = data;
    } else if (min > data) {
      min = data;
    }
  }

  @Nullable
  @Override
  public Double getValue() {
    return min;
  }

  @NotNull
  @Override
  public TotalAggregator newInstance(Format format, Measure measure) {
    return new MinAggregator(format);
  }

}

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

import org.saiku.service.olap.ThinQueryService;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

/**
 * CellSetFormatterFactory.
 */
public class CellSetFormatterFactory {

  private static final Logger LOG = LoggerFactory.getLogger(ThinQueryService.class);

  private Map<String, String> formatters = new HashMap<String, String>();

  private String defaultFormatter = FlattenedCellSetFormatter.class.getName();

  public void setFormatters(Map<String, String> formatters) {
    this.formatters = formatters;
  }

  public void setDefaultFormatter(String clazz) {
    this.defaultFormatter = clazz;
  }

  public CellSetFormatterFactory() {
    formatters.put("flattened", FlattenedCellSetFormatter.class.getName());
    formatters.put("hierarchical", HierarchicalCellSetFormatter.class.getName());
    formatters.put("flat", CellSetFormatter.class.getName());
  }

  @Nullable
  public ICellSetFormatter forName(String name) {
    ICellSetFormatter cf = create(name);
    if (cf == null) {
      cf = create(defaultFormatter);
    }
    return cf;
  }

  @Nullable
  private ICellSetFormatter create(String name) {

    if (StringUtils.isNotBlank(name)) {
      String clazzName = formatters.get(name);
      try {
        @SuppressWarnings("unchecked")
        final Class<ICellSetFormatter> clazz = (Class<ICellSetFormatter>)
            Class.forName(clazzName);
        final Constructor<ICellSetFormatter> ctor = clazz.getConstructor();
        final ICellSetFormatter cellSetFormatter = ctor.newInstance();
        return cellSetFormatter;
      } catch (Exception e) {
        LOG.error("Error creating CellSetFormatter \"" + clazzName + "\"", e);
      }
    }

    return null;
  }


}

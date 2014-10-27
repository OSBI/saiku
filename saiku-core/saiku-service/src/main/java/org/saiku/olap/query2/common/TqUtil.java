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
package org.saiku.olap.query2.common;

import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * TqUtil.
 */
class TqUtil {

  private TqUtil() {

  }

  private static final String FORMULA_BEGIN = "${";
  private static final String FORMULA_END = "}";


  @NotNull
  public static List<String> splitParameterValues(@NotNull String value) {
    List<String> values = new ArrayList<String>();
    if (StringUtils.isNotBlank(value)) {
      String[] vs = value.split(",");
      for (String v : vs) {
        v = v.trim();
        values.add(v);
      }
    }
    return values;
  }

  @NotNull
  public static String replaceParameters(@NotNull String input, @NotNull Map<String, String> parameters) {
    if (StringUtils.isBlank(input)) {
      return input;
    }
    if (!StringUtils.contains(input, FORMULA_BEGIN)) {
      return input;
    }

    int startIdx = StringUtils.indexOf(input, FORMULA_BEGIN);
    int contentStartIdx = startIdx + FORMULA_BEGIN.length();

    if (startIdx > -1) {
      int contentEndIdx = StringUtils.lastIndexOf(input, FORMULA_END);
      int endIdx = contentEndIdx + FORMULA_END.length();
      if (contentEndIdx >= contentStartIdx) {
        String contents = StringUtils.substring(input, contentStartIdx, contentEndIdx);
        if (parameters.containsKey(contents)) {
          StringBuilder result = new StringBuilder();
          result.append(StringUtils.substring(input, 0, startIdx));
          String value = parameters.get(contents);
          result.append(value);
          result.append(StringUtils.substring(input, endIdx, input.length()));

          return result.toString();

        } else {
          throw new RuntimeException("Cannot find value for paramter: " + contents + " in query parameter list!");
        }

      }
    }
    return input;

  }


}

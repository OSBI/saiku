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
package org.saiku.olap.query2.util;

import org.jetbrains.annotations.Nullable;

import java.util.Map;

/**
 * ServiceUtil.
 */
public class ServiceUtil {

  private ServiceUtil() {

  }

  public static String replaceParameters(String query, @Nullable Map<String, String> parameters) {
    if (parameters != null) {
      for (String parameter : parameters.keySet()) {
        String value = parameters.get(parameter);
        if (value == null) {
          value = "";
        }
        query = query.replaceAll("(?i)\\$\\{" + parameter + "\\}", value);
      }
    }
    return query;
  }

}

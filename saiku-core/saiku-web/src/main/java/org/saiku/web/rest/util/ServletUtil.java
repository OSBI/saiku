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

package org.saiku.web.rest.util;

import org.apache.commons.lang.StringUtils;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.MultivaluedMap;

/**
 * Servlet Util.
 */
public class ServletUtil {


  public static final String PREFIX_PARAMETER = "param";

  private ServletUtil() {
  }

  public static Map<String, String> getParameters(HttpServletRequest req) {
    return getParameters(req, PREFIX_PARAMETER);
  }

  public static Map<String, String> getParameters(HttpServletRequest req, String prefix) {

    Map<String, String> queryParams = new HashMap<String, String>();
    if (req != null) {
      // ... and the query parameters
      // We identify any pathParams starting with "param" as query parameters

      // FIXME we should probably be able to have array params as well
      Enumeration<String> enumeration = req.getParameterNames();
      while (enumeration.hasMoreElements()) {
        String param = (String) enumeration.nextElement();
        String value = req.getParameter(param);
        if (StringUtils.isNotBlank(prefix)) {
          if (param.toLowerCase().startsWith(prefix)) {
            param = param.substring(prefix.length());
            queryParams.put(param, value);
          }
        } else {
          queryParams.put(param, value);
        }
      }
    }
    return queryParams;
  }

  public static Map<String, String> getParameters(MultivaluedMap<String, String> formParams) {
    return getParameters(formParams, PREFIX_PARAMETER);
  }

  public static Map<String, String> getParameters(MultivaluedMap<String, String> formParams, String prefix) {
    Map<String, String> queryParams = new HashMap<String, String>();
    if (formParams != null) {
      for (String key : formParams.keySet()) {
        String param = key;
        String value = formParams.getFirst(key);

        if (StringUtils.isNotBlank(prefix)) {
          if (param.toLowerCase().startsWith(prefix)) {
            param = param.substring(prefix.length());
            queryParams.put(param, value);
          }
        } else {
          queryParams.put(param, value);
        }
      }
    }
    return queryParams;

  }

  public static String replaceParameters(String query, Map<String, String> parameters) {
    if (parameters != null) {
      for (String parameter : parameters.keySet()) {
        String value = parameters.get(parameter);
        query = query.replaceAll("(?i)\\$\\{" + parameter + "\\}", value);
      }
    }
    return query;
  }

  public static String replaceParameters(HttpServletRequest req, String query) {
    Map<String, String> queryParams = getParameters(req);
    String r = replaceParameters(query, queryParams);
    return r;
  }

  public static String replaceParameters(MultivaluedMap<String, String> formParams, String query) {
    Map<String, String> queryParams = getParameters(formParams);
    String r = replaceParameters(query, queryParams);
    return r;
  }
}

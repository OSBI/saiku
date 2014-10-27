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

package org.saiku.web.impl;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceProcessor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * RoleDatasourceProcessor.
 */
public class RoleDatasourceProcessor implements IDatasourceProcessor {

  private static final Logger LOG = LoggerFactory.getLogger(RoleDatasourceProcessor.class);
  private static String roleFilter = "role.filter";

  public SaikuDatasource process(SaikuDatasource ds) {
    if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
      String roles = null;
      String filter =
          ds.getProperties().containsKey(roleFilter)
          ? ds.getProperties().getProperty(roleFilter) : null;
      List<String> allowedRoles = new ArrayList<String>();
      if (filter != null) {
        String[] filterRoles = filter.split(",");
        allowedRoles.addAll(Arrays.asList(filterRoles));
      }

      for (GrantedAuthority ga : SecurityContextHolder.getContext().getAuthentication().getAuthorities()) {
        String r = ga.getAuthority();
        boolean isAllowed = true;
        if (filter != null) {
          isAllowed = false;
          for (String allowed : allowedRoles) {
            if (r.toUpperCase().contains(allowed.toUpperCase())) {
              isAllowed = true;
            }
          }
        }
        if (isAllowed) {
          if (roles == null) {
            roles = r;
          } else {
            roles += "," + r;
          }
        }

      }
      String location = ds.getProperties().getProperty("location");
      if (!location.endsWith(";")) {
        location += ";";
      }
      if (roles != null) {
        location += "Role=" + roles + ";";
      }
      LOG.debug(RoleDatasourceProcessor.class.getCanonicalName() + " : location = " + location);
      ds.getProperties().put("location", location);
    }
    return ds;
  }

}

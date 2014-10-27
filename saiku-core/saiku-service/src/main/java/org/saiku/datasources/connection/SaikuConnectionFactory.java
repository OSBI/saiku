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
package org.saiku.datasources.connection;

import org.saiku.datasources.datasource.SaikuDatasource;

import org.jetbrains.annotations.Nullable;


/**
 * SaikuConnectionFactory.
 */
public class SaikuConnectionFactory {


  private SaikuConnectionFactory() {

  }

  @Nullable
  public static ISaikuConnection getConnection(@Nullable SaikuDatasource datasource) throws Exception {
    if (datasource != null) {
      switch (datasource.getType()) {
      case OLAP:
        ISaikuConnection con = new SaikuOlapConnection(datasource.getName(), datasource.getProperties());
        if (con.connect()) {
          return con;
        }
        break;
      }
    }
    return null;
  }
}

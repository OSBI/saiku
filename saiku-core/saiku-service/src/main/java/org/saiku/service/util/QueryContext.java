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
package org.saiku.service.util;

import org.saiku.olap.query2.ThinQuery;
import org.saiku.service.util.exception.SaikuServiceException;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.olap4j.CellSet;

import java.sql.Connection;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * QueryContext.
 */
public class QueryContext {

  private final String id = UUID.randomUUID().toString();

  /**
   * Type.
   */
  public enum Type {
    OLAP
  }

  /**
   * ObjectKey.
   */
  public enum ObjectKey {
    CONTEXT_TYPE,
    CONNECTION,
    RESULT,
    CACHE,
    STATEMENT,
    QUERY
  }

  private final Type type;

  @NotNull
  private final Map<ObjectKey, Object> objects = new HashMap<ObjectKey, Object>();

  public QueryContext(ISaikuQuery query) {
    this.type = Type.OLAP;
    //this.objects.put(ObjectKey.CONNECTION, con);
    this.objects.put(ObjectKey.QUERY, query);
  }

  public String id() {
    return this.id;
  }

  public Type getType() {
    return this.type;
  }

  @NotNull
  Connection getConnection() {
    if (objects.containsKey(ObjectKey.CONNECTION)) {
      return (Connection) objects.get(ObjectKey.CONNECTION);
    }
    throw new SaikuServiceException("Context: " + id + " does not contain a connection object");
  }

  @NotNull
  public ThinQuery getOlapQuery() {
    if (objects.containsKey(ObjectKey.QUERY)) {
      Object o = objects.get(ObjectKey.QUERY);
      if (o instanceof ThinQuery) {
        return (ThinQuery) objects.get(ObjectKey.QUERY);
      }
    }
    throw new SaikuServiceException("Context: " + id + " does not contain a query object");
  }

  @Nullable
  public CellSet getOlapResult() {
    if (objects.containsKey(ObjectKey.RESULT)) {
      Object o = objects.get(ObjectKey.RESULT);
      if (o instanceof CellSet) {
        return (CellSet) objects.get(ObjectKey.RESULT);
      }
    }
    return null;
    //throw new SaikuServiceException("Context: " + id + " does not contain a olap result object");
  }

  @NotNull
  public Statement getStatement() {
    if (objects.containsKey(ObjectKey.STATEMENT)) {
      return (Statement) objects.get(ObjectKey.STATEMENT);
    }
    throw new SaikuServiceException("Context: " + id + " does not contain a statement object");

  }

  public void store(ObjectKey key, Object value) {
    objects.put(key, value);
  }

  public boolean contains(ObjectKey key) {
    return objects.containsKey(key);
  }

  public void remove() {
    if (contains(ObjectKey.STATEMENT)) {
      objects.remove(ObjectKey.STATEMENT);
    }
  }

  public void destroy() throws Exception {
    if (contains(ObjectKey.STATEMENT)) {
      Statement stmt = getStatement();
      stmt.close();
      stmt = null;
    }
    if (contains(ObjectKey.CONNECTION)) {
      Connection con = getConnection();
      con.close();
      con = null;
    }
    objects.clear();
  }


}

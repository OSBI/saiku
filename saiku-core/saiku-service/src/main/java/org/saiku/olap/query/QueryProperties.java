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
package org.saiku.olap.query;

import org.saiku.service.importer.LegacyImporter;

import org.jetbrains.annotations.NotNull;
import org.olap4j.Axis;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;

/**
 * QueryProperties.
 */
public class QueryProperties {

  private static final String KEY_NONEMPTY = "saiku.olap.query.nonempty"; //$NON-NLS-1$
  private static final String KEY_NONEMPTY_ROWS = "saiku.olap.query.nonempty.rows"; //$NON-NLS-1$
  private static final String KEY_NONEMPTY_COLUMNS = "saiku.olap.query.nonempty.columns"; //$NON-NLS-1$
  public static final String KEY_IS_DRILLTHROUGH = "saiku.olap.query.drillthrough"; //$NON-NLS-1$
  private static final String KEY_SUPPORTS_LIMIT = "saiku.olap.query.limit"; //$NON-NLS-1$
  private static final String KEY_SUPPORTS_FILTER = "saiku.olap.query.filter"; //$NON-NLS-1$
  //@formatter:off
  private static final String[] KEYS = {
    KEY_NONEMPTY, KEY_NONEMPTY_ROWS, KEY_NONEMPTY_COLUMNS, KEY_IS_DRILLTHROUGH,
    KEY_SUPPORTS_LIMIT, KEY_SUPPORTS_FILTER };
  //@formatter:on
  private static final Logger LOG = LoggerFactory.getLogger(LegacyImporter.class);

  private QueryProperties() {
  }

  /**
   * QueryPropertyFactory.
   */
  public static class QueryPropertyFactory {
    @NotNull
    private static final QueryProperties Q = new QueryProperties();

    @NotNull
    public static QueryProperty getProperty(final String key, final String value, final OlapQuery query) {
      if (KEY_NONEMPTY_ROWS.equals(key)) {
        return Q.new NonEmptyRowsProperty(query, key, value);
      }
      if (KEY_NONEMPTY_COLUMNS.equals(key)) {
        return Q.new NonEmptyColumnsProperty(query, key, value);
      }
      if (KEY_NONEMPTY.equals(key)) {
        return Q.new NonEmptyProperty(query, key, value);
      }
      if (KEY_IS_DRILLTHROUGH.equals(key)) {
        return Q.new IsDrillthroughProperty(query, key, value);
      }
      if (KEY_SUPPORTS_LIMIT.equals(key)) {
        return Q.new SupportsLimitProperty(query, key, value);
      }
      if (KEY_SUPPORTS_FILTER.equals(key)) {
        return Q.new SupportsFilterProperty(query, key, value);
      }
      return Q.new DummyProperty(query, key, value);
    }

    @NotNull
    public static Properties forQuery(OlapQuery query) {
      Properties props = new Properties();
      for (String key : KEYS) {
        props.putAll(getProperty(key, null, query).getProperties());
      }
      return props;
    }
  }

  /**
   * QueryProperty.
   */
  public abstract class QueryProperty {

    final String key;
    final String value;
    final OlapQuery query;

    public QueryProperty(OlapQuery query, String key, String value) {
      this.key = key;
      this.value = value;
      this.query = query;
    }

    public abstract void handle();

    @NotNull
    public abstract Properties getProperties();

  }

  /**
   * DummyProperty
   */
  public class DummyProperty extends QueryProperty {

    public DummyProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
    }

    @NotNull
    @Override
    public Properties getProperties() {
      return new Properties();
    }

  }

  /**
   * NonEmptyRowsProperty.
   */
  public class NonEmptyRowsProperty extends QueryProperty {

    public NonEmptyRowsProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
      Boolean nonEmpty = Boolean.parseBoolean(NonEmptyRowsProperty.this.value);
      query.getAxis(Axis.ROWS).setNonEmpty(nonEmpty);
    }

    @NotNull
    @Override
    public Properties getProperties() {
      String key = this.key;
      String value = Boolean.toString(query.getAxis(Axis.ROWS).isNonEmpty());
      Properties props = new Properties();
      props.put(key, value);
      return props;
    }

  }

  /**
   * NonEmptyProperty.
   */
  public class NonEmptyProperty extends QueryProperty {

    public NonEmptyProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
      Boolean nonEmpty = Boolean.parseBoolean(NonEmptyProperty.this.value);
      query.getAxis(Axis.ROWS).setNonEmpty(nonEmpty);
      query.getAxis(Axis.COLUMNS).setNonEmpty(nonEmpty);
    }

    @NotNull
    @Override
    public Properties getProperties() {
      String key = this.key;
      String value = Boolean.toString(
          query.getAxis(Axis.COLUMNS).isNonEmpty()
          && query.getAxis(Axis.ROWS).isNonEmpty()
      );
      Properties props = new Properties();
      props.put(key, value);
      return props;
    }

  }

  /**
   * NonemptyColumnsProperty.
   */
  public class NonEmptyColumnsProperty extends QueryProperty {

    public NonEmptyColumnsProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
      Boolean nonEmpty = Boolean.parseBoolean(NonEmptyColumnsProperty.this.value);
      query.getAxis(Axis.COLUMNS).setNonEmpty(nonEmpty);
    }

    @NotNull
    @Override
    public Properties getProperties() {
      String key = this.key;
      String value = Boolean.toString(query.getAxis(Axis.COLUMNS).isNonEmpty());
      Properties props = new Properties();
      props.put(key, value);
      return props;
    }

  }

  /**
   * IsDrillthroughProperty.
   */
  public class IsDrillthroughProperty extends QueryProperty {

    public IsDrillthroughProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
    }

    @NotNull
    @Override
    public Properties getProperties() {
      Properties props = new Properties();
      String key = this.key;
      String value = Boolean.toString(query.isDrillThroughEnabled());
      props.put(key, value);
      return props;
    }

  }

  /**
   * SupportsLimitProperty.
   */
  public class SupportsLimitProperty extends QueryProperty {

    public SupportsLimitProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
    }

    @NotNull
    @Override
    public Properties getProperties() {
      Properties props = new Properties();
      String key = this.key;
      String value = Boolean.FALSE.toString();
      try {
        query.getAxis(Axis.COLUMNS).getLimitFunction();
        value = Boolean.TRUE.toString();
      } catch (Error e) {
        LOG.error("Couldn't get Limit function", e);

      }
      props.put(key, value);
      return props;
    }

  }

  /**
   * SupportsFilterProperty.
   */
  public class SupportsFilterProperty extends QueryProperty {

    public SupportsFilterProperty(OlapQuery query, String key, String value) {
      super(query, key, value);
    }

    @Override
    public void handle() {
    }

    @NotNull
    @Override
    public Properties getProperties() {
      Properties props = new Properties();
      String key = this.key;
      String value = Boolean.FALSE.toString();
      try {
        query.getAxis(Axis.COLUMNS).getFilterCondition();
        value = Boolean.TRUE.toString();
      } catch (Error e) {
        LOG.error("couldn't get filter condition", e);

      }
      props.put(key, value);
      return props;
    }

  }

}

package org.saiku.olap.query;

import java.util.Properties;

import org.olap4j.Axis;

public class QueryProperties {

	public abstract class QueryProperty {

		protected String key;
		protected String value;
		protected OlapQuery query;

		public static final String KEY_NONEMPTY			= "saiku.olap.query.nonempty"; //$NON-NLS-1$
		public static final String KEY_NONEMPTY_ROWS	= "saiku.olap.query.nonempty.rows"; //$NON-NLS-1$
		public static final String KEY_NONEMPTY_COLUMNS = "saiku.olap.query.nonempty.columns"; //$NON-NLS-1$
		public final String[] KEYS = new String[] { KEY_NONEMPTY_ROWS, KEY_NONEMPTY_COLUMNS };

		public QueryProperty(OlapQuery query, String key, String value) {
			this.key = key;
			this.value = value;
			this.query = query;
		}

		public abstract void handle();
		public abstract Properties getProperties();

	}
	public class DummyProperty extends QueryProperty {

		public DummyProperty(OlapQuery query, String key, String value) {
			super(query,key,value);
		}

		@Override
		public void handle() {	}

		@Override
		public Properties getProperties() { return new Properties(); }

	}


	public class NonEmptyRowsProperty extends QueryProperty {

		public NonEmptyRowsProperty(OlapQuery query, String key, String value) {
			super(query,key,value);
		}

		@Override
		public void handle() {
			Boolean nonEmpty = Boolean.parseBoolean(NonEmptyRowsProperty.this.value);
			query.getAxis(Axis.ROWS).setNonEmpty(nonEmpty);
		}

		@Override
		public Properties getProperties() {
			String key = this.key;
			String value = Boolean.toString(query.getAxis(Axis.ROWS).isNonEmpty());
			Properties props = new Properties();
			props.put(key, value);
			return props;
		}

	}
	
	public class NonEmptyProperty extends QueryProperty {

		public NonEmptyProperty(OlapQuery query, String key, String value) {
			super(query,key,value);
		}

		@Override
		public void handle() {
			Boolean nonEmpty = Boolean.parseBoolean(NonEmptyProperty.this.value);
			query.getAxis(Axis.ROWS).setNonEmpty(nonEmpty);
			query.getAxis(Axis.COLUMNS).setNonEmpty(nonEmpty);
		}

		@Override
		public Properties getProperties() {
			String key = this.key;
			String value = Boolean.toString(
					query.getAxis(Axis.COLUMNS).isNonEmpty() &&
					query.getAxis(Axis.ROWS).isNonEmpty());
			Properties props = new Properties();
			props.put(key, value);
			return props;
		}

	}

	public class NonEmptyColumnsProperty extends QueryProperty {

		public NonEmptyColumnsProperty(OlapQuery query, String key, String value) {
			super(query,key,value);
		}

		@Override
		public void handle() {
			Boolean nonEmpty = Boolean.parseBoolean(NonEmptyColumnsProperty.this.value);
			query.getAxis(Axis.COLUMNS).setNonEmpty(nonEmpty);
		}
		
		@Override
		public Properties getProperties() {
			String key = this.key;
			String value = Boolean.toString(query.getAxis(Axis.COLUMNS).isNonEmpty());
			Properties props = new Properties();
			props.put(key, value);
			return props;
		}

	}
	
	public static class QueryPropertyFactory {
		private static QueryProperties q = new QueryProperties();
		public static QueryProperty getProperty(final String key, final String value, final OlapQuery query) {
			if (QueryProperty.KEY_NONEMPTY_ROWS.equals(key)) {
				return q.new NonEmptyRowsProperty(query, key, value);
			}
			if (QueryProperty.KEY_NONEMPTY_COLUMNS.equals(key)) {
				return q.new NonEmptyColumnsProperty(query, key, value);
			}
			if (QueryProperty.KEY_NONEMPTY.equals(key)) {
				return q.new NonEmptyProperty(query, key, value);
			}
			return q.new DummyProperty(query, key, value);
		}
		
		public static Properties forQuery(OlapQuery query) {
			Properties props = new Properties();
			props.putAll(getProperty(QueryProperty.KEY_NONEMPTY_ROWS, null, query).getProperties());
			props.putAll(getProperty(QueryProperty.KEY_NONEMPTY_COLUMNS, null, query).getProperties());
			props.putAll(getProperty(QueryProperty.KEY_NONEMPTY, null, query).getProperties());
			return props;
		}
	}
	

	
}

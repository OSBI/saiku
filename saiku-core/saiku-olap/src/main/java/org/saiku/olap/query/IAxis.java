package org.saiku.olap.query;

public abstract class IAxis  {

	Standard FILTER = Standard.FILTER;

	Standard COLUMNS = Standard.COLUMNS;

	Standard ROWS = Standard.ROWS;

	Standard UNUSED = Standard.UNUSED;

	public abstract boolean isFilter();
	
	public abstract int axisOrdinal();
	
	public abstract String getCaption();

	public enum Standard {
		FILTER, COLUMNS, ROWS, UNUSED;

		public int axisOrdinal() {
			return ordinal() - 1;
		}

		public boolean isFilter() {
			return this == FILTER;
		}

		public String getCaption() {
			return name();
		}

	}

	public static IAxis forName(String name) {
		if (name == null) {
			throw new IllegalArgumentException("Axis ordinal must be -1 or higher"); //$NON-NLS-1$
		}
		for (final Standard axis : Standard.values()) {
			if (axis.toString().equals(name)) {
				return new IAxis() {

					public String toString() {
						return name();
					}

					public String name() {
						return axis.toString();
					}

					public boolean isFilter() {
						return Standard.FILTER.equals(axis);
					}

					public int axisOrdinal() {
						return axis.ordinal();
					}

					public String getCaption() {
						return name();
					}

				};
			}

		}
		return null;
	}

	public static IAxis forOrdinal(final int ordinal) {
		if (ordinal < -1) {
			throw new IllegalArgumentException("Axis ordinal must be -1 or higher"); //$NON-NLS-1$
		}

		return new IAxis() {

			public String toString() {
				return name();
			}

			public String name() {
				return "AXIS(" + ordinal + ")"; //$NON-NLS-1$//$NON-NLS-2$
			}

			public boolean isFilter() {
				return false;
			}

			public int axisOrdinal() {
				return ordinal;
			}

			public String getCaption() {
				return name();
			}
		};
	}
}

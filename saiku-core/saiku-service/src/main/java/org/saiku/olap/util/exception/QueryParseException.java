package org.saiku.olap.util.exception;

public class QueryParseException extends RuntimeException {

	private static final long serialVersionUID = -1674892615129992198L;

    public QueryParseException(String arg0, Throwable arg1) {
        super(arg0, arg1);
    }

    public QueryParseException(String arg0) {
        super(arg0);
    }
}

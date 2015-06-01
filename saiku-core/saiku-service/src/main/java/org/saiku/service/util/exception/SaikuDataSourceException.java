package org.saiku.service.util.exception;

public class SaikuDataSourceException extends SaikuServiceException {

    /**
     * @see java.lang.Exception#Exception()
     */
    public SaikuDataSourceException() {
        super();
    }

    /**
     * @see java.lang.Exception#Exception(String))
     */

    public SaikuDataSourceException(String message) {
        super(message);
    }

    /**
     * @see java.lang.Exception#Exception(Throwable)
     */
    public SaikuDataSourceException(Throwable cause) {
        super(cause);
    }

    /**
     * @see java.lang.Exception#Exception(String, Throwable)
     */
    public SaikuDataSourceException(String message, Throwable cause) {
        super(message, cause);
    }

}

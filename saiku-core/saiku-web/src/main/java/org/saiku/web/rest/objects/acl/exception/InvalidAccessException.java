package org.saiku.web.rest.objects.acl.exception;

public class InvalidAccessException extends RuntimeException{

	/**
	 * 
	 */
	private static final long serialVersionUID = -7081979024234312374L;

	public InvalidAccessException(){super();};
	public InvalidAccessException(String message){super(message);}
}

/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.service.util.exception;

public class SaikuServiceException extends RuntimeException {

	private static final long serialVersionUID = 6079334291828346380L;
	
	/**
	 * @see java.lang.Exception#Exception()
	 */
	public SaikuServiceException() {
		super();
	}
	
	/**
	 * @see java.lang.Exception#Exception(String))
	 */

	public SaikuServiceException(String message) {
		super(message);
	}

	/**
	 * @see java.lang.Exception#Exception(Throwable)
	 */
	public SaikuServiceException(Throwable cause) {
		super(cause);
	}
	
	/**
	 * @see java.lang.Exception#Exception(String, Throwable)
	 */
	public SaikuServiceException(String message, Throwable cause) {
		super(message,cause);
	}
}

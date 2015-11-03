/*
 * Copyright (c) 2012 David Stites, Patrik Dufresne and others.
 * 
 * You may distribute under the terms of either the MIT License, the Apache
 * License 2.0 or the Simplified BSD License, as specified in the README file.
 * 
 * Contributors:
 *     David Stites - initial API and implementation
 *     Patrik Dufresne - refactoring
 */
package org.saiku.license;

/**
 * This exception regroup all the license exceptions.
 *
 * @author Patrik Dufresne
 */
public class LicenseException extends Exception {

  private static final long serialVersionUID = 7895696254570225320L;

  /**
   * Constructs a new exception with null as its detail message. The cause is
   * not initialized, and may subsequently be initialized by a call to
   * Throwable.initCause(java.lang.Throwable).
   */
  public LicenseException() {
    this(null, null);
  }

  /**
   * Constructs a new exception with the specified message.
   *
   * @param message the detail message (which is saved for later retrieval by
   *                the Throwable.getMessage() method).
   */
  public LicenseException(String message) {
    this(message, null);
  }

  /**
   * Constructs a new exception with the specified cause.
   *
   * @param cause the cause (which is saved for later retrieval by the
   *              Throwable.getCause() method). (A null value is permitted, and
   *              indicates that the cause is nonexistent or unknown.)
   */
  public LicenseException(Throwable cause) {
    this(null, cause);
  }

  /**
   * Constructs a new exception with the specified detail message and cause.
   *
   * @param message the detail message (which is saved for later retrieval by
   *                the Throwable.getMessage() method).
   * @param cause   the cause (which is saved for later retrieval by the
   *                Throwable.getCause() method). (A null value is permitted,
   *                and indicates that the cause is nonexistent or unknown.)
   */
  private LicenseException(String message, Throwable cause) {
    super(message, cause);
  }

}

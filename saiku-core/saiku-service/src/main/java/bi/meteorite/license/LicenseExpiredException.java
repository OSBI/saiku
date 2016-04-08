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
package bi.meteorite.license;

/**
 * Thrown when the license validation determine the license to be expired. The
 * expiration date should then by retrieve using the {@link
 * AbstractLicense#getExpiration()}.
 *
 * @author Patrik Dufresne
 */
public class LicenseExpiredException extends LicenseException {

  private static final long serialVersionUID = -9069804052012922999L;

  /**
   * Constructs a new exception with null as its detail message. The cause is
   * not initialized, and may subsequently be initialized by a call to
   * Throwable.initCause(java.lang.Throwable).
   */
  public LicenseExpiredException() {
    super("license expired");
  }

}

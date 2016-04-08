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
 * This exception is throw when the license version doesn't match the current
 * version.
 *
 * @author Patrik Dufresne
 */
public class LicenseVersionExpiredException extends LicenseException {

  private static final long serialVersionUID = 8947235554238066208L;

  public LicenseVersionExpiredException() {
    super("version expired");
  }

}

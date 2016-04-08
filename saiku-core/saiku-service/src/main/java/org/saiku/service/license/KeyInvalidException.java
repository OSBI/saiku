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
package org.saiku.service.license;

import bi.meteorite.license.LicenseException;

/**
 * This exception is throw when the key manager determine the key as invalid
 * because of the checksum or because it's been wrongly generated.
 *
 * @author Patrik Dufresne
 */
public class KeyInvalidException extends LicenseException {

  private static final long serialVersionUID = 3455646784833396158L;

  public KeyInvalidException() {
    super("invalid key");
  }
}

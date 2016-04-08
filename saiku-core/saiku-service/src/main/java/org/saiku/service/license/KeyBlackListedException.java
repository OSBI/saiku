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
 * This exception is throw by the key manager when the key is determined to be
 * black listed.
 *
 * @author Patrik Dufresne
 */
public class KeyBlackListedException extends LicenseException {

  private static final long serialVersionUID = 4833729281645719038L;

  public KeyBlackListedException() {
    super("black listed key");
  }
}

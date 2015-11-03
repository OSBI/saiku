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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.util.Date;

/**
 * Abstract implementation of the license interface use by the license manager.
 *
 * @author Patrik Dufresne
 */
public abstract class AbstractLicense implements Serializable, ILicense {

  private static final long serialVersionUID = -144058457108187374L;
  private static final Logger log =
      LoggerFactory.getLogger(AbstractLicense.class);

  /**
   * License type for lifetime version. Always valid.
   */
  public static final String TYPE_LIFETIME = "lifetime";
  /**
   * License type for single version. This type is valid for the given version.
   */
  public static final String TYPE_SINGLE_VERSION = "single-version";
  /**
   * License type for trial version. This type is valid until the expiration
   * date.
   */
  private static final String TYPE_TRIAL = "trial";

  public static final String TYPE_FULL = "full";
  public static final String TYPE_FULL_MAX_MEM = "full-maxmem";
  private String email;

  private Date expiration;

  private String licenseNumber;

  private String licenseType;
  private String name;
  private String version;

  /**
   * Create a new license with default property value.
   */
  AbstractLicense() {
    name = "";
    email = "";
    licenseNumber = "";
    expiration = new Date();
    version = "";
    licenseType = TYPE_TRIAL;
  }

  /**
   * Return the associated email value.
   *
   * @return the email or null
   */
  public String getEmail() {
    return email;
  }

  /**
   * @return the expiration
   */
  public Date getExpiration() {
    return expiration;
  }

  /**
   * @return the licenseNumber
   */
  public String getLicenseNumber() {
    return licenseNumber;
  }

  /**
   * Return the license type.
   *
   * @return the licenseType
   */
  String getLicenseType() {
    return licenseType;
  }

  /**
   * Return the name associated with the license.
   *
   * @return the name or null
   */
  public String getName() {
    return name;
  }

  /**
   * Return the license version
   *
   * @return the version or null
   */
  public String getVersion() {
    return version;
  }

  /**
   * Sets the associated email
   *
   * @param email the email or null.
   */
  public void setEmail(String email) {
    this.email = email;
  }

  /**
   * Set the license expiration date. Required with TYPE_TRIAL
   *
   * @param expiration the expiration date or null.
   */
  public void setExpiration(Date expiration) {
    this.expiration = expiration;
  }

  /**
   * Sets the license number.
   *
   * @param licenseNumber the licenseNumber
   */
  public void setLicenseNumber(String licenseNumber) {
    this.licenseNumber = licenseNumber;
  }

  /**
   * Sets the license type.
   *
   * @param licenseType the licenseType, one of the TYPE_* constants (can't be
   *                    null).
   */
  public void setLicenseType(String licenseType) {
    if (licenseType == null) {
      throw new NullPointerException();
    }
    this.licenseType = licenseType;
  }

  /**
   * Sets the name associated with the license
   *
   * @param name the name or null
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Sets the license version. Required with SINGLE_VERSION.
   *
   * @param version the version or null
   */
  public void setVersion(String version) {
    this.version = version;
  }

  /**
   * Check if the given license object is valid.
   *
   */
  public void validate(Date currentDate, String currentVersion) throws LicenseException {

  }

  /**
   * Used to validate the expiration date according to the license type.
   *
   * @param currentDate the current date.
   */
  void validateExpiration(Date currentDate) {

  }

  /**
   * Used to validate the version according to the license type.
   *
   * @param currentVersion
   */
  void validateVersion(String currentVersion) {


  }

}

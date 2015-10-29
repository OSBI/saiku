/* Copyright (C) OSBI Ltd - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by OSBI LTD, 2014
 */

package org.saiku;


import org.saiku.license.SaikuLicense;
import org.saiku.license.SaikuLicense2;
import org.saiku.license.UserQuota;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.jcr.RepositoryException;

/**
 * Created by bugg on 01/07/14.
 */
public class LicenseUtils {
  public void init() {

  }

  public LicenseUtils() {

  }

  public void setLicense(SaikuLicense lic) {

    //Stub for EE

  }

  public void setLicense(String lic) {
    //Stub for EE
  }

  public Object getLicense()
      throws IOException, ClassNotFoundException, RepositoryException {

    SaikuLicense2 sl = new SaikuLicense2();

    sl.setLicenseType("Open Source License");
    sl.setUserLimit(10000000);
    sl.setHostname(InetAddress.getLocalHost().getHostName());
    sl.setEmail("info@meteorite.bi");
    String string = "January 1, 2500";
    DateFormat format = new SimpleDateFormat("MMMM d, yyyy", Locale.ENGLISH);
    Date date = null;
    try {
      date = format.parse(string);
    } catch (ParseException e) {
      e.printStackTrace();
    }
    sl.setExpiration(date);
    sl.setName("Meteorite BI");
    return sl;

    }

  public void validateLicense()
      throws Exception {
    Object l = getLicense();

    if(l instanceof SaikuLicense) {
      ((SaikuLicense)l).validate(new Date(), getVersion());
    }
    else if(l instanceof  SaikuLicense2){
      ((SaikuLicense2)l).validate(new Date(), getVersion());
    }
    else{
      throw new Exception("Can't validate license");
    }
  }

  private String getVersion() {
    Properties prop = new Properties();
    InputStream input = null;
    String version = "";
    ClassLoader classloader = Thread.currentThread().getContextClassLoader();
    InputStream is = classloader.getResourceAsStream(
        "org/saiku/web/rest/resources/version.properties");
    try {

      //input = new FileInputStream("version.properties");

      // load a properties file
      prop.load(is);

      // get the property value and print it out
      version = prop.getProperty("VERSION");
    } catch (IOException ex) {
      ex.printStackTrace();
    } finally {
      if (input != null) {
        try {
          input.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    return version;
  }

  public List<UserQuota> getQuota() {
    List<UserQuota> list = new ArrayList<>();
    return list;
  }
}

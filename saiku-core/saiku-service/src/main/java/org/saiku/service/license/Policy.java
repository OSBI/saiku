/* Copyright (C) OSBI Ltd - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by OSBI LTD, 2014
 */

package org.saiku.service.license;

/**
 * The Policy class handles settings for behavior, debug flags and logging
 * within the license framework.
 */
public class Policy {

  private static ILogger log;

  private Policy(){
  }
  /**
   * Returns the dummy log to use if none has been set
   */
  private static ILogger getDummyLog() {
    return new ILogger() {
      @Override
      public void log(String level, String message) {
        System.out.print(level + " " + message);
      }

      @Override
      public void log(String level, Throwable exception) {
        exception.printStackTrace(System.out);
      }
    };
  }

  /**
   * Returns the logger used by the license framework to log errors. <p> The
   * default logger prints the status to <code>System.err</code>. </p>
   *
   * @return the logger
   */
  public static ILogger getLog() {
    if (log == null) {
      log = getDummyLog();
    }
    return log;
  }

  /**
   * Sets the logger used by the license framework to log errors.
   *
   * @param logger the logger to use, or <code>null</code> to use the default
   *               logger
   */
  public static void setLog(ILogger logger) {
    log = logger;
  }

}

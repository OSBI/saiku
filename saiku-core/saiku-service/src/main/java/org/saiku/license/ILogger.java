/* Copyright (C) OSBI Ltd - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by OSBI LTD, 2014
 */

package org.saiku.license;

/**
 * A mechanism to log errors throughout the license framework. <p> Clients may
 * provide their own implementation to change how errors are logged from within
 * the license framework. </p>
 */
public interface ILogger {
  /**
   * Trace level (value: trace).
   */
  String TRACE = "trace";
  /**
   * Debug level (value: debug).
   */
  String DEBUG = "debug";
  /**
   * Info level (value: info).
   */
  String INFO = "info";
  /**
   * Warn level (value: warn).
   */
  String WARN = "warn";
  /**
   * Error level (value: error).
   */
  String ERROR = "error";

  /**
   * Logs the given status.
   *
   * @param level   The level
   * @param message The message to be logged.
   */
  void log(String level, String message);

  /**
   * Logs the given exception.
   *
   * @param level
   * @param exception
   */
  void log(String level, Throwable exception);

}

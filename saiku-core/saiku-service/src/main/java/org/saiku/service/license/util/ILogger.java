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
package org.saiku.service.license.util;

/**
 * A mechanism to log errors throughout the license framework. <p> Clients may
 * provide their own implementation to change how errors are logged from within
 * the license framework. </p>
 */
public interface ILogger {
  /**
   * Trace level (value: trace).
   */
  public static final String TRACE = "trace";
  /**
   * Debug level (value: debug).
   */
  public static final String DEBUG = "debug";
  /**
   * Info level (value: info).
   */
  public static final String INFO = "info";
  /**
   * Warn level (value: warn).
   */
  public static final String WARN = "warn";
  /**
   * Error level (value: error).
   */
  public static final String ERROR = "error";

  /**
   * Logs the given status.
   *
   * @param level   The level
   * @param message The message to be logged.
   */
  public void log(String level, String message);

  /**
   * Logs the given exception.
   *
   * @param level
   * @param exception
   */
  public void log(String level, Throwable exception);

}

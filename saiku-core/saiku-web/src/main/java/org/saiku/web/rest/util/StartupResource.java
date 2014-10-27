/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.saiku.web.rest.util;

import com.sun.jersey.spi.container.servlet.WebComponent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.logging.Level;

/**
 * Statup Resource.
 */
public class StartupResource {

  private static final Logger LOG = LoggerFactory.getLogger(StartupResource.class);

  public void init() {
    //com.sun.jersey.spi.container.servlet.WebComponent
    try {
      java.util.logging.Logger jerseyLogger = java.util.logging.Logger.getLogger(WebComponent.class.getName());
      if (jerseyLogger != null) {
        jerseyLogger.setLevel(Level.SEVERE);
        LOG.debug("Disabled INFO Logging for com.sun.jersey.spi.container.servlet.WebComponent");
      } else {
        LOG.debug("No jersey logger");
      }
    } catch (Exception e) {
      LOG.error("Trying to disabling logging for com.sun.jersey.spi.container.servlet.WebComponent INFO Output failed",
          e);
    }
  }

}

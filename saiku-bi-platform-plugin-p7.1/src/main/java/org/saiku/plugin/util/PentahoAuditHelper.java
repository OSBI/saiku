/*
 *   Copyright 2015 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.plugin.util;


import org.saiku.audit.SaikuAuditHelper;

import org.pentaho.platform.api.engine.ILogger;
import org.pentaho.platform.engine.core.audit.AuditHelper;
import org.pentaho.platform.engine.core.audit.MessageTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

/**
 * Created by bugg on 22/09/15.
 */
public class PentahoAuditHelper implements SaikuAuditHelper {

  private static final Logger log = LoggerFactory.getLogger(PentahoAuditHelper.class);

  public UUID startAudit(String processId, String actionName, String objectName, String userSession, String
      sessionId, String message, Object logger) {
    UUID uuid = UUID.randomUUID();

    try {
      AuditHelper.audit(sessionId, userSession, actionName, objectName,
          processId, MessageTypes.INSTANCE_START, uuid.toString(), message, 0, (ILogger)logger);
    } catch ( Exception e ) {
      log.warn( "Exception while writing to audit log. Returning null as audit event ID but"
                + " will continue execution ", e );
      return null;
    }

    return uuid;
  }

  public void endAudit(String processId, String actionName, String objectName, String userSession, String
      sessionId, Object logger, long start, UUID uuid, long end) {
    this.endAudit(processId, actionName, objectName, userSession, sessionId, null, logger, start, uuid, end);
  }

  public void endAudit(String processId, String actionName, String objectName, String userSession, String
      sessionId, String message, Object logger, long start, UUID uuid, long end) {
    try {
      AuditHelper.audit(sessionId, userSession, actionName, objectName, processId,
          MessageTypes.INSTANCE_END, uuid.toString(), message, ( (float) ( end - start ) / 1000 ), (ILogger)logger );
    } catch ( Exception e ) {
      log.warn( "Exception while writing to audit log. Returning null as audit event ID but"
                + " will continue execution ", e );
    }
  }
}

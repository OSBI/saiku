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
package org.saiku.web.rest.resources;

import org.saiku.service.ISessionService;
import org.saiku.service.user.UserService;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;


/**
 * Session Resouce.
 */
@Component
@Path("/saiku/session")
public class SessionResource {


  private static final Logger LOG = LoggerFactory.getLogger(SessionResource.class);

  private ISessionService sessionService;
  private UserService userService;

  public void setSessionService(ISessionService ss) {
    this.sessionService = ss;
  }

  public void setUserService(UserService us) {
    userService = us;
  }

  @POST
  @Consumes("application/x-www-form-urlencoded")
  public Response login(
      @Context HttpServletRequest req,
      @FormParam("username") String username,
      @FormParam("password") String password) {
    try {
      sessionService.login(req, username, password);
      return Response.ok().build();
    } catch (Exception e) {
      LOG.debug("Error logging in:" + username, e);
      return Response.status(Status.INTERNAL_SERVER_ERROR).entity(e.getLocalizedMessage()).build();
    }
  }

  @GET
  @Consumes("application/x-www-form-urlencoded")
  @Produces(MediaType.APPLICATION_JSON)
  public Map<String, Object> getSession(@Context HttpServletRequest req) {

    Map<String, Object> sess = sessionService.getSession();
    try {
      String acceptLanguage = req.getLocale().getLanguage();
      if (StringUtils.isNotBlank(acceptLanguage)) {
        sess.put("language", acceptLanguage);
      }
    } catch (Exception e) {
      LOG.debug("Cannot get language!", e);
    }

    try {
      sess.put("isadmin", userService.isAdmin());
    } catch (Exception e) {
      //throw new UnsupportedOperationException();
    }
    try {
      userService.checkFolders();
    } catch (Exception e) {
      //TODO detect if plugin or not.
    }
    return sess;
  }

  @DELETE
  public Response logout(@Context HttpServletRequest req) {
    sessionService.logout(req);
    //NewCookie terminate = new NewCookie(TokenBasedRememberMeServices.SPRING_SECURITY_REMEMBER_ME_COOKIE_KEY, null);

    return Response.ok().build();

  }


}

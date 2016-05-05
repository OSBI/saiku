/*
 *   Copyright 2016 OSBI Ltd
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

package org.saiku.web.service;

import java.io.IOException;
import java.util.concurrent.ConcurrentMap;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class HazelcastAuthFilter implements Filter {
  private static final int FIVE_MINUTES = 300; // in miliseconds

  private boolean enabled;
  private String orbisAuthCookie;
  private String hazelcastMapName;
  private String baseWorkspaceDir;

  private FilterConfig filterConfig;

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    setFilterConfig(filterConfig);

    enabled          = Boolean.parseBoolean(initParameter(filterConfig, "enabled", "true"));
    orbisAuthCookie  = initParameter(filterConfig, "orbisAuthCookie", "SAIKU_AUTH_PRINCIPAL");
    hazelcastMapName = initParameter(filterConfig, "hazelcastMapName", "my-sessions");
    baseWorkspaceDir = initParameter(filterConfig, "baseWorkspaceDir", "../../repository/data");
  }

  private String initParameter(FilterConfig filterConfig, String paramName, String defaultValue) {
    if (filterConfig.getInitParameter(paramName) != null) {
      return filterConfig.getInitParameter(paramName);
    }
    return defaultValue;
  }

  @Override
  public void destroy() {
  }

  @Override
  public void doFilter(
    ServletRequest req,
    ServletResponse res,
    FilterChain chain) throws IOException, ServletException {
    if (enabled) {
      String authUser = getCookieValue(req, orbisAuthCookie);

      HttpSession session = ((HttpServletRequest)req).getSession(true);

      System.out.println("\n***********************************");
      System.out.println("***********************************");
      System.out.println("SESSION: " + session.getClass());
      System.out.println("Session ID: " + session.getId());

      for (java.util.Enumeration<String> e = session.getAttributeNames(); e.hasMoreElements(); ) {
        String sessionKey = e.nextElement();
        System.out.println(sessionKey + " = " + session.getAttribute(sessionKey));
      }

      System.out.println("***********************************");
      System.out.println("***********************************\n");

/*      if (authUser != null) { // If is the main machine, which receives the auth cookie
        // Broadcast the cookie to the distributed session
        ((HttpServletRequest)req).getSession(true).setAttribute("ORBIS_WORKSPACE_DIR", authUser);
        session.setAttribute(orbisAuthCookie, authUser);
      } else { // If does not receives the auth cookie
        String cookieVal = (String)session.getAttribute(orbisAuthCookie);
        if (cookieVal != null) { // Check if it is at the distributed session
          setCookieValue(res, orbisAuthCookie, cookieVal);
        }
      }*/
    }

    chain.doFilter(req, res);
  }

  private String getCookieValue(ServletRequest req, String cookieName) {
    HttpServletRequest request = (HttpServletRequest) req;
    Cookie[] cookies = request.getCookies();

    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if (cookie.getName().equals(cookieName)) {
          return cookie.getValue();
        }
      }
    }

    return null;
  }

  private void setCookieValue(ServletResponse res, String cookieName, String cookieVal) {
    HttpServletResponse response = (HttpServletResponse) res;
    Cookie orbisCookie = new Cookie(cookieName, cookieVal);
    orbisCookie.setMaxAge(FIVE_MINUTES);
    orbisCookie.setPath("/");
    response.addCookie(orbisCookie);
  }

  public FilterConfig getFilterConfig() {
    return filterConfig;
  }

  public void setFilterConfig(FilterConfig filterConfig) {
    this.filterConfig = filterConfig;
  }
}

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

import com.hazelcast.config.Config;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import org.saiku.service.datasource.RepositoryDatasourceManager;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.io.File;
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

public class HazelcastAuthFilter implements Filter {
  private static final int FIVE_MINUTES = 300; // in miliseconds

  private boolean enabled;
  private String orbisAuthCookie;
  private String hazelcastMapName;
  private String baseWorkspaceDir;

  private static HazelcastInstance hazelcast;
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
      ConcurrentMap<String, String> distributedSession = getHazelcastMap();

      if (authUser != null) { // If is the main machine, which receives the auth cookie
        // Broadcast the cookie to the distributed session
        reloadWorkspace(req, authUser); // Setup the workspace dir and reload the spring application context
        distributedSession.putIfAbsent(orbisAuthCookie, authUser);
      } else { // If does not receives the auth cookie
        if (distributedSession.containsKey(orbisAuthCookie)) { // Check if it is at the distributed session
          setCookieValue(res, orbisAuthCookie, distributedSession.get(orbisAuthCookie));
        }
      }
    }

    chain.doFilter(req, res);
  }

  private void reloadWorkspace(ServletRequest req, String user) {
    HttpServletRequest request = (HttpServletRequest) req;
    if (request.getSession(false) == null) {
      try {
        reloadWorkspace(baseWorkspaceDir + File.separator + user);
      } catch (Exception ex) {
        System.err.println(ex.getMessage());
        ex.printStackTrace();
      }
      request.getSession(true);
    }
  }

  private void reloadWorkspace(String dataDir) throws Exception {
    WebApplicationContext applicationContext = WebApplicationContextUtils.getWebApplicationContext(getFilterConfig().getServletContext());

    RepositoryDatasourceManager dsManager = (RepositoryDatasourceManager)applicationContext.getBean("repositoryDsManager");
    dsManager.setDatadir(dataDir);
    dsManager.load();

    ((org.saiku.service.license.LicenseUtils)applicationContext.getBean("licenseUtilsBean")).init();
    ((org.saiku.database.Database)applicationContext.getBean("h2database")).init();
    ((org.saiku.datasources.connection.MondrianVFS)applicationContext.getBean("mondrianVFS")).init();
    ((org.saiku.web.core.SecurityAwareConnectionManager)applicationContext.getBean("connectionManager")).init();
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

  private ConcurrentMap<String, String> getHazelcastMap() {
    if (hazelcast == null) {
      Config config = new Config();
      hazelcast = Hazelcast.newHazelcastInstance(config);
    }

    return hazelcast.getMap(hazelcastMapName);
  }

  public FilterConfig getFilterConfig() {
    return filterConfig;
  }

  public void setFilterConfig(FilterConfig filterConfig) {
    this.filterConfig = filterConfig;
  }
}

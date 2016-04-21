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
import org.springframework.security.core.context.SecurityContextImpl;

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
import javax.servlet.http.HttpSession;

public class HazelcastAuthFilter implements Filter {
  private static final String SAIKU_USER = "SAIKU_USER";

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  }

  @Override
  public void destroy() {
  }

  @Override
  public void doFilter(
    ServletRequest req,
    ServletResponse res,
    FilterChain chain) throws IOException, ServletException {

    HttpServletRequest request = (HttpServletRequest) req;
    HttpSession session = request.getSession(false);

    SecurityContextImpl sci = (SecurityContextImpl)session.getAttribute("SPRING_SECURITY_CONTEXT");

    if (sci != null) {
      String authUser = null;
      Cookie[] cookies = request.getCookies();

      if (cookies != null) {
        for (Cookie cookie : cookies) {
          if (cookie.getName().equals(SAIKU_USER)) {
            authUser = cookie.getValue();
            break;
          }
        }
      }

      Config config = new Config();
      HazelcastInstance h = Hazelcast.newHazelcastInstance(config);
      ConcurrentMap<String, String> distributedSession = h.getMap("saiku-sessions");

      if (authUser != null) { // If is the main machine, which receives the auth cookie
        // Broadcast the cookie to the distributed session
        distributedSession.put(SAIKU_USER, authUser);
        sci.getAuthentication().setAuthenticated(true);
      } else { // If does not receives the auth cookie
        if (distributedSession.containsKey(SAIKU_USER)) { // Check if it is at the distributed session
          // If so, authenticate
          sci.getAuthentication().setAuthenticated(true);
        }
      }
    }

    chain.doFilter(req, res);
  }

}

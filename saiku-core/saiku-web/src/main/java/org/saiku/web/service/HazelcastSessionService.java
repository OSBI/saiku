package org.saiku.web.service;

import com.hazelcast.client.HazelcastClient;
import com.hazelcast.client.config.ClientConfig;
import org.saiku.service.ISessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.*;

import com.hazelcast.core.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Created by brunogamacatao on 15/02/17.
 */
public class HazelcastSessionService implements ISessionService {
  private static final Logger log = LoggerFactory.getLogger(HazelcastSessionService.class);

  private String mapName;
  private String username;
  private String password;
  private String clusterAddress;
  private String usernameToken;
  private String roleToken;

  private AuthenticationManager authenticationManager;

  private final Map<Object,Map<String,Object>> sessionHolder = new HashMap<>();

  @Override
  public Map<String, Object> login(HttpServletRequest req, String username, String password) throws Exception {
    ClientConfig clientConfig = new ClientConfig();
    clientConfig.getGroupConfig().setName(username).setPassword(password);
    clientConfig.getNetworkConfig().addAddress(clusterAddress);

    HazelcastInstance client = HazelcastClient.newHazelcastClient(clientConfig);
    Map<String, Object> mappedCache = client.getMap(mapName);

    if (mappedCache.containsKey(usernameToken)) {
      String principal = (String) mappedCache.get(usernameToken);

      if (sessionHolder.containsKey(principal)) {
        return sessionHolder.get(principal);
      } else {
        Map<String, Object> session = new HashMap<>();

        if (mappedCache.containsKey(roleToken)) {
          String role = (String) mappedCache.get(roleToken);

          session.put("username", principal);
          session.put("password", principal);
          session.put("sessionid", UUID.randomUUID().toString());
          session.put("authid", RequestContextHolder.currentRequestAttributes().getSessionId());

          if (authenticationManager != null) {
            authenticate(req, username, principal);
          }

          List<String> roles = new ArrayList<>();
          roles.add(role);

          session.put("roles", roles);

          sessionHolder.put(principal, session);
        }

        return session;
      }
    }

    return null;
  }

  @Override
  public void logout(HttpServletRequest req) {
    if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
      Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
      if (sessionHolder.containsKey(p)) {
        sessionHolder.remove(p);
      }
    }

    SecurityContextHolder.getContext().setAuthentication(null);
    SecurityContextHolder.clearContext();
    HttpSession session = req.getSession(false);

    if (session != null) {
      session.invalidate();
    }
  }

  @Override
  public void authenticate(HttpServletRequest req, String username, String password) {
    try {
      UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
      token.setDetails(new WebAuthenticationDetails(req));
      Authentication authentication = this.authenticationManager.authenticate(token);
      log.debug("Logging in with [{}]", authentication.getPrincipal());
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (BadCredentialsException ex) {
      throw new RuntimeException("Authentication failed for: " + username, ex);
    }
  }

  @Override
  public Map<String, Object> getSession() throws Exception {
    if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      Object p = auth.getPrincipal();
      if (sessionHolder.containsKey(p)) {
        Map<String, Object> r = new HashMap<>();
        r.putAll(sessionHolder.get(p));
        r.remove("password");
        return r;
      }

    }
    return new HashMap<>();
  }

  @Override
  public Map<String, Object> getAllSessionObjects() {
    if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      Object p = auth.getPrincipal();
      if (sessionHolder.containsKey(p)) {
        Map<String,Object> r = new HashMap<>();
        r.putAll(sessionHolder.get(p));
        return r;
      }

    }
    return new HashMap<>();
  }

  @Override
  public void clearSessions(HttpServletRequest req, String username, String password) throws Exception {
    if (authenticationManager != null) {
      authenticate(req, username, password);
    }

    if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      Object p = auth.getPrincipal();
      if (sessionHolder.containsKey(p)) {
        sessionHolder.remove(p);
      }
    }
  }

  public String getMapName() {
    return mapName;
  }

  public void setMapName(String mapName) {
    this.mapName = mapName;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getClusterAddress() {
    return clusterAddress;
  }

  public void setClusterAddress(String clusterAddress) {
    this.clusterAddress = clusterAddress;
  }

  public String getUsernameToken() {
    return usernameToken;
  }

  public void setUsernameToken(String usernameToken) {
    this.usernameToken = usernameToken;
  }

  public String getRoleToken() {
    return roleToken;
  }

  public void setRoleToken(String roleToken) {
    this.roleToken = roleToken;
  }

  public AuthenticationManager getAuthenticationManager() {
    return authenticationManager;
  }

  public void setAuthenticationManager(AuthenticationManager authenticationManager) {
    this.authenticationManager = authenticationManager;
  }
}

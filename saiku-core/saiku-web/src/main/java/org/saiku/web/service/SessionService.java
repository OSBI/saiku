/*  
 *   Copyright 2012 OSBI Ltd
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.saiku.service.ISessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;


public class SessionService implements ISessionService {

	private static final Logger log = LoggerFactory.getLogger(SessionService.class);

	private AuthenticationManager authenticationManager;

	Map<Object,Map<String,Object>> sessionHolder = new HashMap<Object,Map<String,Object>>();

	private Boolean anonymous = false;
	
	public void setAllowAnonymous(Boolean allow) {
		this.anonymous  = allow;
	}


	/* (non-Javadoc)
	 * @see org.saiku.web.service.ISessionService#setAuthenticationManager(org.springframework.security.authentication.AuthenticationManager)
	 */
	public void setAuthenticationManager(AuthenticationManager auth) {
		this.authenticationManager = auth;
	}

	/* (non-Javadoc)
	 * @see org.saiku.web.service.ISessionService#login(javax.servlet.http.HttpServletRequest, java.lang.String, java.lang.String)
	 */
	public Map<String, Object> login(HttpServletRequest req, String username, String password ) {
		if (authenticationManager != null) {
			authenticate(req, username, password);
		}
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {			
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			Object p = auth.getPrincipal();
			createSession(auth, username, password);
			return sessionHolder.get(p);
		}
		return new HashMap<String, Object>();
	}

	private void createSession(Authentication auth, String username, String password) {

		if (auth ==  null || !auth.isAuthenticated()) {
			return;
		}
		
		boolean isAnonymousUser = (auth instanceof AnonymousAuthenticationToken);		
		Object p = auth.getPrincipal();
		String authUser = getUsername(p);
		boolean isAnonymous = (isAnonymousUser || StringUtils.equals("anonymousUser", authUser));
		boolean isAnonOk = (!isAnonymous || (isAnonymous && anonymous));
			
		if (isAnonOk && auth.isAuthenticated() && p != null && !sessionHolder.containsKey(p)) {
			Map<String, Object> session = new HashMap<String, Object>();
			
			if (isAnonymous) {
				log.debug("Creating Session for Anonymous User");
			}
			
			if (StringUtils.isNotBlank(username)) {
				session.put("username", username);
			} else {
				session.put("username", authUser);
			}
			if (StringUtils.isNotBlank(password)) {
				session.put("password", password);		
			}
			session.put("sessionid", UUID.randomUUID().toString());
			
			List<String> roles = new ArrayList<String>();
			for (GrantedAuthority ga : SecurityContextHolder.getContext().getAuthentication().getAuthorities()) {
				roles.add(ga.getAuthority());
			}
			session.put("roles", roles);
			
			sessionHolder.put(p, session);
		}
	}

	private String getUsername(Object p) {
		
		if (p instanceof UserDetails) {
			  return ((UserDetails)p).getUsername();
		} 
		return p.toString();
	}

	/* (non-Javadoc)
	 * @see org.saiku.web.service.ISessionService#logout(javax.servlet.http.HttpServletRequest)
	 */
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

	/* (non-Javadoc)
	 * @see org.saiku.web.service.ISessionService#authenticate(javax.servlet.http.HttpServletRequest, java.lang.String, java.lang.String)
	 */
	public void authenticate(HttpServletRequest req, String username, String password) {
		try {
			UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
			token.setDetails(new WebAuthenticationDetails(req));
			Authentication authentication = this.authenticationManager.authenticate(token);
			log.debug("Logging in with [{}]", authentication.getPrincipal());
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}
		catch (BadCredentialsException bd) {
			throw new RuntimeException("Authentication failed for: " + username, bd);
		}

	}

	/* (non-Javadoc)
	 * @see org.saiku.web.service.ISessionService#getSession(javax.servlet.http.HttpServletRequest)
	 */
	public Map<String,Object> getSession() {
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {			
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			Object p = auth.getPrincipal();
			createSession(auth, null, null);
			if (sessionHolder.containsKey(p)) {
				Map<String,Object> r = new HashMap<String,Object>();
				r.putAll(sessionHolder.get(p)); 
				r.remove("password");
				return r;
			}

		}
		return new HashMap<String,Object>();
	}
	
	public Map<String,Object> getAllSessionObjects() {
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {			
			Authentication auth = SecurityContextHolder.getContext().getAuthentication();
			Object p = auth.getPrincipal();
			createSession(auth, null, null);
			if (sessionHolder.containsKey(p)) {
				Map<String,Object> r = new HashMap<String,Object>();
				r.putAll(sessionHolder.get(p)); 
				return r;
			}

		}
		return new HashMap<String,Object>();
	}
}

/*
 * Copyright (C) 2011 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */

package org.saiku.web.rest.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.rememberme.TokenBasedRememberMeServices;
import org.springframework.stereotype.Component;


@Component
@Path("/session")
@Scope("request")
public class SessionResource  {


	private static final Logger log = LoggerFactory.getLogger(SessionResource.class);

	//	private OlapQueryService olapQueryService;
	//
	//	@Autowired
	//	public void setOlapQueryService(OlapQueryService olapqs) {
	//		olapQueryService = olapqs;
	//	}

	Map<Object,Map<String,Object>> sessionHolder = new HashMap<Object,Map<String,Object>>();


	private AuthenticationManager authenticationManager;

	public void setAuthenticationManager(AuthenticationManager auth) {
		this.authenticationManager = auth;
	}

	@POST
	@Consumes("application/x-www-form-urlencoded")
	public Response login(
			@Context HttpServletRequest req,
			@FormParam("username") String username, 
			@FormParam("password") String password) 
	{
		try {
			UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
			token.setDetails(new WebAuthenticationDetails(req));
			Authentication authentication = this.authenticationManager.authenticate(token);
			log.debug("Logging in with [{}]", authentication.getPrincipal());
			SecurityContextHolder.getContext().setAuthentication(authentication);
			System.out.println("LOGIN:" + username + "/" + password);

			if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {			
				Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
				if (!sessionHolder.containsKey(p)) {
					sessionHolder.put(p, new HashMap<String,Object>());
				}
				sessionHolder.get(p).put("username", username);
				sessionHolder.get(p).put("password", password);
				sessionHolder.get(p).put("sessionid", UUID.randomUUID().toString());
				List<String> roles = new ArrayList<String>();
				for (GrantedAuthority ga : authentication.getAuthorities()) {
					roles.add(ga.getAuthority());
				}
				sessionHolder.get(p).put("roles", roles);
			}
			return Response.ok().build();
		}
		catch (BadCredentialsException bd) {
			System.out.println("Login failed for: " + username);
			return Response.status(Status.FORBIDDEN).build();
		}
		catch (Exception e) {
			log.error("Error logging in",e);
			e.printStackTrace();
			return Response.serverError().build();
		}
	}

	@GET
	@Consumes("application/x-www-form-urlencoded")
	@Produces(MediaType.APPLICATION_JSON)
	public Map<String,Object> getSession(@Context HttpServletRequest req) {
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {			
			Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if (sessionHolder.containsKey(p)) {
				Map<String,Object> r = new HashMap<String,Object>();
				r.putAll(sessionHolder.get(p)); 
				r.remove("password");
				return r;
			}
			
		}
		return new HashMap<String,Object>();
	}

	@DELETE
	public Response logout(@Context HttpServletRequest req) 
	{
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
			Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			if (sessionHolder.containsKey(p)) {
				sessionHolder.remove(p);
			}
		}
		SecurityContextHolder.clearContext(); //invalidate authentication
		HttpSession session= req.getSession(true); 
		session.invalidate();
		NewCookie terminate = new NewCookie(TokenBasedRememberMeServices.SPRING_SECURITY_REMEMBER_ME_COOKIE_KEY, null);

		return Response.ok().cookie(terminate).build();

	}
	//
	//	@GET
	//	@Path("/check")
	//	@Consumes("application/x-www-form-urlencoded")
	//	@Produces(MediaType.TEXT_PLAIN)
	//	public String checkLogin(
	//			@QueryParam("user") String username, 
	//			@QueryParam("password") String password) 
	//	{
	//
	//		try {
	//			// Must be called from request filtered by Spring Security, otherwise SecurityContextHolder is not updated
	//			UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
	//			token.setDetails(new WebAuthenticationDetails(req));
	//			Authentication authentication = this.authenticationManager.authenticate(token);
	//			log.debug("Logging in with [{}]", authentication.getPrincipal());
	//			SecurityContextHolder.getContext().setAuthentication(authentication);
	//			return "OK";
	//		} catch (Exception e) {
	//			SecurityContextHolder.getContext().setAuthentication(null);
	//			log.error("Failure in autoLogin", e);
	//		}
	//		return "False";
	//	}


}

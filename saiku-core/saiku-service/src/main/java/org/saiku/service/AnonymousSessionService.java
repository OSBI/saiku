package org.saiku.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

public class AnonymousSessionService implements ISessionService {

	
	HashMap<String, Object> session = new HashMap<String, Object>();
	
	public AnonymousSessionService() {
		session.put("username", "anonymous");
		session.put("sessionid", UUID.randomUUID().toString());
		session.put("roles", new ArrayList<String>());
		
		
	}
	public Map<String, Object> login(HttpServletRequest req, String username,
			String password) {
		// TODO Auto-generated method stub
		return null;
	}

	public void logout(HttpServletRequest req) {
		// TODO Auto-generated method stub

	}

	public void authenticate(HttpServletRequest req, String username,
			String password) {
		// TODO Auto-generated method stub

	}

	public Map<String, Object> getSession() {
		return session;
	}

	public Map<String, Object> getAllSessionObjects() {
		return session;
	}

}

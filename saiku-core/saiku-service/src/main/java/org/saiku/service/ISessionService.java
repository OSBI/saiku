package org.saiku.service;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public interface ISessionService {

	public Map<String, Object> login(HttpServletRequest req,
			String username, String password);

	public void logout(HttpServletRequest req);

	public void authenticate(HttpServletRequest req, String username,
			String password);

	public Map<String, Object> getSession();
	
	public Map<String,Object> getAllSessionObjects();

}
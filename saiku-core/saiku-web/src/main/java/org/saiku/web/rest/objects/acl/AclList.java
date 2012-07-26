package org.saiku.web.rest.objects.acl;

import java.util.ArrayList;
import java.util.List;

/**
 * The pojo that contains the lists of users and roles for each resource
 * @author ferrema
 *
 */
public class AclList {
	/**
	 * the list of the users
	 */
	List<String> users =  new ArrayList<String>();
	/**
	 * the list of the roles
	 */
	List<String> roles =  new ArrayList<String>();
	public List<String> getUsers() {
		return users;
	}
	public void setUsers(List<String> users) {
		this.users = users;
	}
	public List<String> getRoles() {
		return roles;
	}
	public void setRoles(List<String> roles) {
		this.roles = roles;
	}
	/**
	 * if the list of roles is empty, by default the role is contained ( no restriction ) 
	 * @param role
	 * @return
	 */
	public boolean containsRole(String role){
		return roles.size() == 0 || roles.contains(role);
	}
	/**
	 * if the list of users is empty, by default the user is contained ( no restriction ) 
	 * @param user
	 * @return
	 */
	public boolean containsUser(String user){
		return users.size() == 0 || users.contains(user);
	}
}

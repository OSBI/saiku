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
		return roles == null || roles.size() == 0 || roles.contains(role);
	}
	/**
	 * if the list of users is empty, by default the user is contained ( no restriction ) 
	 * @param user
	 * @return
	 */
	public boolean containsUser(String user){
		return users == null || users.size() == 0 || users.contains(user);
	}
	/**
	 * checks if any of the roles contained in the param
	 * is present in the role list
	 * @param roles
	 * @return
	 */
	public boolean containsRole(List<String> roles ){
		return containsRole(roles,true);
	}
	/**
	 * checks if all the roles in the parameter list
	 * is contained in the list of roles
	 * @param roles
	 * @return
	 */
	public boolean containsAllRoles(List<String> roles ){
		return containsRole(roles,false);
	}
	
	/**
	 * Checks if the list of roles passed as parameter is contained in 
	 * the list of roles. If the parameter <pre>any</pre> is <pre>true</pre> 
	 * the function returns true if any of the roles in the parameter
	 * is present in the roles list; if the parameter <pre>any</pre> 
	 * is <pre>false</pre> then the function returns true if and only 
	 * if all the roles contained in the parameter is present in the list
	 * of roles 
	 * @param roles
	 * @param any
	 * @return 
	 */
	private boolean containsRole(List<String> roles , boolean any ) {
		if ( any ) {
			for ( String string : roles ) {
				if ( this.roles.contains(string) ) return true;
			}
			return false;
		} else if (roles.size() <= this.roles.size() ) {
			for ( String string : roles ) {
				if ( !this.roles.contains(string) ) return false;
			}
			return true;
		}
		return false;
	}
}


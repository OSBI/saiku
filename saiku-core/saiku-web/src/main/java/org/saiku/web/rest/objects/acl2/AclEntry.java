package org.saiku.web.rest.objects.acl2;

import java.util.List;
import java.util.Map;

import org.saiku.web.rest.objects.acl2.enumeration.AclMethod;
import org.saiku.web.rest.objects.acl2.enumeration.AclType;

public class AclEntry {

	private String owner;
	private AclType type = AclType.PUBLIC;
	
	private Map<String,List<AclMethod>> roles;
	private Map<String,List<AclMethod>> users;
	
	
	
	public AclEntry (String owner) {
		this.owner = owner;
	}

	public AclEntry (String owner, AclType type) {
		this.owner = owner;
		this.type = type;
	}

	public String getOwner() {
		return owner;
	}

	public AclType getType() {
		return type;
	}

	public Map<String, List<AclMethod>> getRoles() {
		return roles;
	}

	public void setRoles(Map<String, List<AclMethod>> roles) {
		this.roles = roles;
	}

	public Map<String, List<AclMethod>> getUsers() {
		return users;
	}

	public void setUsers(Map<String, List<AclMethod>> users) {
		this.users = users;
	}

	
	
}

package org.saiku.web.rest.objects.acl;

import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.vfs.FileObject;

/**
 * main object to which one can query resources access
 * @author ferrema
 *
 */
public class Acl {

	/**
	 * this is the access control list
	 */
	Map<String, AclResource> acl = new TreeMap<String, AclResource>();
		
	
	AclResource getAcl(String resource, String parent){
		AclResource aclResource = acl.get(resource);
		if (aclResource == null ) {
			AclResource parentResource = null;
			/*
			 * check the parent for inheritance
			 */
			if ( parent != null){
				parentResource = acl.get(parent);
			}
			/*
			 *  resource not present: create 
			 *  a default acl where access is 
			 *  public
			 */
			aclResource = new AclResource();
			/*
			 * if parent is present the resource
			 * will inherit
			 */
			aclResource.setParent(parentResource); 
			acl.put(resource, aclResource);
		}
		return aclResource;
	}

	/**
	 * reads a json file that contains the acl for a directory
	 * @param jsonFile
	 */
	void readAcl(FileObject jsonFile){
		//TODO : read the file
		//TODO : traverse the tree and create AclResource for each resource
		//TODO : add the AclResource to acl map
	}
	/**
	 * this method will actually check a resource permissions
	 * @param username the user name accessing the resource 
	 * @param rolename the role name accessing the resource
	 * @param resource the resource being accessed
	 * @param parent the parent resource being accessed
	 * @return
	 */
	public AclMethod getAccess(String username, String rolename, String resource, String parent ) {
		AclResource aclResource = getAcl(resource, parent);
		
		switch (aclResource.getType()) {
		case PUBLIC:
			return AclMethod.WRITE;
		case ROLE:
			if ( aclResource.canWrite(rolename) ) return AclMethod.WRITE;
			if ( aclResource.canRead(rolename) ) return AclMethod.READ;
		case USER:
			if ( aclResource.canWrite(username) ) return AclMethod.WRITE;
			if ( aclResource.canRead(username) ) return AclMethod.READ;
		default:
			return AclMethod.NONE;
		}
	}
}

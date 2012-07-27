package org.saiku.web.rest.objects.acl;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.vfs.FileContent;
import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemException;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.saiku.web.rest.objects.acl.enumeration.AclMethod;

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
		
	
	
	public Map<String, AclResource> getAclMap(){
		return acl;
	}
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
	public boolean readAcl(FileObject jsonFile){
			ObjectMapper mapper = new ObjectMapper();
			FileContent fc;
			InputStream is ;
			try {
				fc = jsonFile.getContent();
				is = fc.getInputStream(); 
				this.acl = (Map<String, AclResource>)mapper.readValue(is , 	TypeFactory.mapType(HashMap.class, String.class, AclResource.class));
				fc.close();
				is.close();
				return true;
			} catch (FileSystemException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (JsonParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (JsonMappingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
			return false;
	}
	
	/**
	 * Creates an open access acl
	 */
	public void setOpenAccess(){
		acl.clear(); //cleans the map : everything is open access
	}
	
	public boolean serialize(FileObject jsonFile) {
		ObjectMapper mapper = new ObjectMapper();
		FileContent fc;
		try {
			fc = jsonFile.getContent();
			mapper.writeValue(fc.getOutputStream(), this.acl);
			fc.close();
		} catch (JsonGenerationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FileSystemException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return false;
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
		List<String> roles = new ArrayList<String>();
		roles.add(rolename);
		return getAccess(username, roles, resource, parent );
	}
	public AclMethod getAccess(String username, List<String> roles, String resource, String parent ) {
		AclResource aclResource = getAcl(resource, parent);
		
		switch (aclResource.getType()) {
		case PUBLIC:
			return AclMethod.WRITE;
		case ROLE:
			if ( aclResource.canWrite(null,roles) ) return AclMethod.WRITE;
			if ( aclResource.canRead(null,roles) ) return AclMethod.READ;
			break;
		case USER:
			if ( aclResource.canWrite(username,roles) ) return AclMethod.WRITE;
			if ( aclResource.canRead(username,roles) ) return AclMethod.READ;
			break;
		default:
			return AclMethod.NONE;
		}
		return AclMethod.NONE;
	}
	
	public boolean canRead(String username, List<String> roles, String resource, String parent ) {
		AclMethod method = getAccess(username, roles, resource, parent );
		return method == AclMethod.READ || method == AclMethod.WRITE;
	}
	
	public boolean canWrite(String username, List<String> roles, String resource, String parent ) {
		return getAccess(username, roles, resource, parent ) == AclMethod.WRITE;
	}
	
	/**
	 * this method tells if the user/role has grant option in the current resource.
	 * @param username
	 * @param rolename
	 * @param resource
	 * @param parent
	 * @return
	 */
	public boolean canGrant(String username, String rolename, String resource, String parent ) {
		return  getAcl(resource, parent).canGrant(username, rolename); 
	}

}

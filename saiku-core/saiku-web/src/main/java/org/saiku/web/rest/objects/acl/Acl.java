package org.saiku.web.rest.objects.acl;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.vfs.FileContent;
import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemException;
import org.apache.commons.vfs.FileType;
import org.apache.commons.vfs.NameScope;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.saiku.web.rest.objects.acl.enumeration.AclMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * main object to which one can query resources access
 * 
 * @author ferrema
 * 
 */
public class Acl {

	/**
	 * holds the actual acl map
	 */
	private Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();
	/**
	 * the logger 
	 */
	private static final Logger logger = LoggerFactory.getLogger(Acl.class);
	/**
	 * the file that holds the ACL
	 */
	private static final String SAIKUACCESS_FILE = ".saikuaccess";

	/**
	 * The list of the roles that can always manage a resource.
	 */
	private List<String> adminRoles;
	

	
	/**
	 * Returns the access method to the specified resource for the user or role
	 * @param resource the resource to which you want to access
	 * @param username the username of the user that's accessing
	 * @param role the role of the user that's accessing
	 * @return {@link AclMethod}
	 */
	public AclMethod getMethod(FileObject resource, String username, String role) {
		String name = resource.getName().getPath();
		AclEntry entry = acl.get(name);
		AclMethod method = AclMethod.WRITE; // default if nothing in acl and
											// parent == null
		AclMethod parentMethod = null;

		FileObject parent = null;
		try {
			parent = resource.getParent();
			if (parent == null) // fs root
				parentMethod = method;
			// recursively go up to the root
			parentMethod = getMethod(parent, username, role);
		} catch (FileSystemException e) {
			logger.error("Error getting the parent",e);
		}

		if (entry != null) {
			if ( isAdminRole(role) ) return AclMethod.GRANT;
			switch (entry.getType()) {
			case PRIVATE:
				if (!entry.getOwner().equals(username))
					method = AclMethod.NONE;
				break;
			case SECURED:
				// check user permission
				List<AclMethod> userMethods = entry.getUsers().get(username);
				if (userMethods == null) { // check the role
					List<AclMethod> roleMethods = entry.getRoles().get(role);
					if (roleMethods == null || roleMethods.size() == 0) {
						// no role nor user acl
						method = AclMethod.NONE;
					} else {
						// return the strongest role
						method = AclMethod.max(roleMethods);
					}
				} else {
					method = AclMethod.max(userMethods);
				}

				break;
			default:
				// PUBLIC ACCESS
				method = AclMethod.WRITE;
				break;
			}
		}
		
		// now, if parent is more restrictive return parent, else return child
		method = AclMethod.min(method, parentMethod);

		return method;
	}
	
	/**
	 * Returns the access method to the specified resource for the user or role
	 * @param resource the resource to which you want to access
	 * @param username the username of the user that's accessing
	 * @param roles the role of the user that's accessing
	 * @return {@link AclMethod}
	 */
	public AclMethod getMethod(FileObject resource, String username, List<String> roles) {
		String name = resource.getName().getPath();
		AclEntry entry = acl.get(name);
		AclMethod method = AclMethod.WRITE; // default if nothing in acl and
											// parent == null
		AclMethod parentMethod = null;

		FileObject parent = null;
		try {
			parent = resource.getParent();
			if (parent == null) // fs root
				parentMethod = method;
			// recursively go up to the root
			parentMethod = getMethod(parent, username, roles);
		} catch (FileSystemException e) {
			logger.error("Error getting the parent",e);
		}
		if (entry != null) {
			if ( isAdminRole(roles) ) return AclMethod.GRANT;
			switch (entry.getType()) {
			case PRIVATE:
				if (!entry.getOwner().equals(username))
					method = AclMethod.NONE;
				break;
			case SECURED:
				// check user permission
				List<AclMethod> userMethods = entry.getUsers().get(username);
				if (userMethods == null) { // check the role
					List<AclMethod> roleMethods = new ArrayList<AclMethod>();
					for ( String role:roles){
						roleMethods.addAll(entry.getRoles().get(role));
					}
					if (roleMethods == null || roleMethods.size() == 0) {
						// no role nor user acl
						method = AclMethod.NONE;
					} else {
						// return the strongest role
						method = AclMethod.max(roleMethods);
					}
				} else {
					method = AclMethod.max(userMethods);
				}

				break;
			default:
				// PUBLIC ACCESS
				method = AclMethod.WRITE;
				break;
			}
		}
		
		// now, if parent is more restrictive return parent, else return child
		method = AclMethod.min(method, parentMethod);

		return method;

	}
	
	/**
	 * helper method to add an acl entry
	 * @param resource resource for which we're setting the 
	 * access control
	 * @param entry
	 */
	public void addEntry(FileObject resource, AclEntry entry) {
		acl.put(resource.getName().getPath(), entry);
	}

	public AclEntry getEntry(FileObject resource ) {
		return this.acl.get(resource.getName().getPath());
	}
	/**
	 * Helper method to test if the resource is readable by the 
	 * user or role
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param role the role of the user that wants access
	 * @return true if the resource is marked > {@link AclMethod#NONE} 
	 */
	public boolean canRead(FileObject resource, String username, String role) {
		if ( resource == null ) return false;
		// if > NONE then can read
		return !AclMethod.max(AclMethod.NONE,
				getMethod(resource, username, role)).equals(AclMethod.NONE); 
	}
	
	/**
	 * Helper method to test if the resource is readable by the 
	 * user or roles
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param roles the roles of the user that wants access
	 * @return true if the resource is marked > {@link AclMethod#NONE} 
	 */
	public boolean canRead(FileObject resource, String username, List<String> roles) {
		if ( resource == null ) return false;
		// if > NONE then can read
		return !AclMethod.max(AclMethod.NONE,
				getMethod(resource, username, roles)).equals(AclMethod.NONE); 
	}
	/**
	 * Helper method to test if the resource is writeable by a user or role
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param role the role of the user that wants access
	 * @return true if the resource is marked  {@link AclMethod#WRITE} or {@link AclMethod#GRANT} 
	 */
	public boolean canWrite(FileObject resource, String username, String role) {
		if ( resource == null ) return false;
		AclMethod method = getMethod(resource, username, role);
		return method.equals(AclMethod.WRITE) || method.equals(AclMethod.GRANT);
	}
	/**
	 * Helper method to test if the resource is writeable by a user or roles
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param roles the roles of the user that wants access
	 * @return true if the resource is marked  {@link AclMethod#WRITE} or {@link AclMethod#GRANT} 
	 */
	public boolean canWrite(FileObject resource, String username, List<String> roles) {
		if ( resource == null ) return false;
		AclMethod method = getMethod(resource, username, roles);
		return method.equals(AclMethod.WRITE) || method.equals(AclMethod.GRANT);
	}
	/**
	 * Helper method to test if the resource is grantable by a user or role
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param role the role of the user that wants access
	 * @return true if the resource is marked  {@link AclMethod#GRANT} 
	 */
	public boolean canGrant(FileObject resource, String username, String role) {
		return !AclMethod.max(AclMethod.GRANT,
				getMethod(resource, username, role)).equals(AclMethod.GRANT); 
	}
	/**
	 * Searches the acl file for the resource in the resource's directory
	 * ( or inside teh resource's childre if the resource is a directory ), 
	 * reads the file and adds all the acl entries to the global acl map
	 * @param resource
	 */
	public void readAcl(FileObject resource) {
		FileObject jsonFile = null;
		try {
			if (resource.getType().equals(FileType.FOLDER)) {
				jsonFile = resource.getChild(SAIKUACCESS_FILE);
			} else {
				jsonFile = resource.getParent().getChild(SAIKUACCESS_FILE);
			}
		} catch (Exception e) {
			logger.error("Error opening the " + SAIKUACCESS_FILE + "file",e);
		}
		acl.putAll(deserialize(jsonFile));
	}

	/**
	 * writes the acl of the resource in the resource's directory
	 * @param resource
	 */
	public void writeAcl(FileObject resource) {
		//TODO : shall throw an IllegalArgumentException ? 
		if ( resource == null ) return; //do nothing on null
		FileObject jsonFile = null;
		try{
			if ( resource.getType().equals(FileType.FOLDER) ) {
				// the json file is in here
				jsonFile = resource.resolveFile(SAIKUACCESS_FILE, NameScope.FILE_SYSTEM);
			} else {
				// the json file is in the parent folder
				jsonFile = resource.getParent().resolveFile(SAIKUACCESS_FILE, NameScope.FILE_SYSTEM);
			}
			if ( jsonFile != null && jsonFile.isWriteable() ) {
				serialize(jsonFile, getAcl(resource, false));
			}
		} catch ( FileSystemException e ) {
			logger.error("Error getting hold of the file " + SAIKUACCESS_FILE, e );
		}
	}
	/**
	 * Serializes in json format the acl passed as parameter into 
	 * the specified file
	 * @param jsonFile the file where to write the acl
	 * @param acl the acl to serialize
	 */
	private void serialize(FileObject jsonFile, Map<String,AclEntry> acl) {
		ObjectMapper mapper = new ObjectMapper();
		try{
			jsonFile.delete();
			OutputStreamWriter ow = new OutputStreamWriter(jsonFile.getContent().getOutputStream());
			BufferedWriter bw = new BufferedWriter(ow);
			mapper.writeValue(bw,acl);
			
			bw.flush();
			bw.close();
			ow.close();
		} catch (JsonGenerationException e) {
			logger.error("Error generating json file",e);
		} catch (JsonMappingException e) {
			logger.error("Error mapping Acl to JSON ", e);
		} catch (IOException e) {
			logger.error("Error writing data to file",e);

		}

	}
	/**
	 * internal method. reads the acl file and creates an acl map
	 * @param jsonFile the file containing the acl 
	 * @return the acl map represented by the acl file
	 */
	private Map<String, AclEntry> deserialize(FileObject jsonFile) {
		ObjectMapper mapper = new ObjectMapper();
		FileContent fc;
		InputStream is;
		Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();
		if ( jsonFile != null ) {
			try {
				fc = jsonFile.getContent();
				is = fc.getInputStream();
				acl = (Map<String, AclEntry>) mapper.readValue(is, TypeFactory
						.mapType(HashMap.class, String.class, AclEntry.class));
				fc.close();
				is.close();
			} catch (FileSystemException e) {
				logger.error("Error opening the file ",e);
			} catch (JsonParseException e) {
				logger.error("Error parsing the json file", e);
			} catch (JsonMappingException e) {
				logger.error("Error converting the json file", e);
			} catch (IOException e) {
				logger.error("IO error reading the json file", e);
			}
		}
		return acl;
	}
	
	/**
	 * Returns the acl of the resource. If the resource is a directory
	 * it returns the acl of the resource and of all the children. If 
	 * any of the children is a folder then its content is not inspected 
	 * @param resource the resource
	 * @return
	 */
	private Map<String, AclEntry> getAcl(FileObject resource) {
		return getAcl(resource, false);
	}
	/**
	 * Returns the acl of the resource. If the resource is a directory
	 * it returns the acl of the resource and of all the children. 
	 * If the parameter <pre>recurse</pre> is <pre>true</pre> then 
	 * if any of the children is a directory its content is inspected 
	 * @param resource
	 * @param recurse
	 * @return
	 */
	private Map<String, AclEntry> getAcl(FileObject resource, boolean recurse) {

		Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();
		String key = resource.getName().getPath();
		try {
			if ( resource.getType().equals(FileType.FOLDER) ) {
				for ( FileObject file :  resource.getChildren() ) {
					acl.putAll(getAcl(file,recurse));
				}
			}
		} catch (FileSystemException e) {
			logger.error("Error traversing the resource " + resource.getName().getPath() ,e );
		}
		AclEntry entry = this.acl.get(key);
		if ( entry == null ) {
			entry = new AclEntry();
		}
		if ( entry != null ) acl.put(resource.getName().getPath(), entry);
		return acl;
		
	}
	/**
	 * Returns the list of the administrator roles
	 * @return
	 */
	public List<String> getAdminRoles() {
		return adminRoles;
	}
	/**
	 * Sets the list of the administrator roles
	 * @param adminRoles
	 */
	public void setAdminRoles(List<String> adminRoles) {
		this.adminRoles = adminRoles;
	}
	/**
	 * Checks if a specific role is in the list of the admin roles
	 * @param role
	 * @return
	 */
	private boolean isAdminRole(String role){
		return adminRoles.contains(role);
	}
	/**
	 * Checks if a list of roles contains an admin role
	 * @param roles
	 * @return
	 */
	private boolean isAdminRole(List<String> roles){
		for (String role:roles)
			if ( isAdminRole(role)) return true;
		return false;
	}
}

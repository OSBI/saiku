package org.saiku.web.rest.objects.acl2;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.vfs.FileContent;
import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemException;
import org.apache.commons.vfs.FileType;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.saiku.web.rest.objects.acl.AclResource;
import org.saiku.web.rest.objects.acl2.enumeration.AclMethod;

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
			// TODO some decent logging
			e.printStackTrace();
		}

		if (entry != null) {
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
	 * helper method to add an acl entry
	 * @param resource resource for which we're setting the 
	 * access control
	 * @param entry
	 */
	public void addEntry(FileObject resource, AclEntry entry) {
		acl.put(resource.getName().getPath(), entry);
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
		// if > NONE then can read
		return !AclMethod.max(AclMethod.NONE,
				getMethod(resource, username, role)).equals(AclMethod.NONE); 
	}
	/**
	 * Helper method to test if the resource is writeable by a user or role
	 * @param resource the resource being tested
	 * @param username the user name that wants to access 
	 * @param role the role of the user that wants access
	 * @return true if the resource is marked  {@link AclMethod#WRITE} or {@link AclMethod#GRANT} 
	 */
	public boolean canWrite(FileObject resource, String username, String role) {
		AclMethod method = getMethod(resource, username, role);
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
				jsonFile = resource.getChild(".saikuaccess");
			} else {
				jsonFile = resource.getParent().getChild(".saikuaccess");
			}
		} catch (Exception e) {
			// TODO some decent logging
		}
		acl.putAll(deserialize(jsonFile));
	}

	/**
	 * writes the acl of the resource in the resource's directory
	 * @param resource
	 */
	public void writeAcl(FileObject resource) {
		//TODO : method 
	}
	/**
	 * Serializes in json format the acl passed as parameter into 
	 * the specified file
	 * @param jsonFile the file where to write the acl
	 * @param acl the acl to serialize
	 */
	private void serialize(FileObject jsonFile, Map<String,AclEntry> acl) {
		//TODO : method
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
		}
		return acl;
	}
}

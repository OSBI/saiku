package org.saiku.web.rest.objects.acl2;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemException;
import org.saiku.web.rest.objects.acl2.enumeration.AclMethod;

/**
 * main object to which one can query resources access
 * @author ferrema
 *
 */
public class Acl {

	private Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();
	
	

	public AclMethod getMethod(FileObject resource, String username, String role ){
		String name = resource.getName().getPath();
		AclEntry entry = acl.get(name);
		AclMethod method = AclMethod.WRITE; // default if nothing in acl and parent == null
		AclMethod parentMethod = null;
		
		
		FileObject parent = null;
		try {
			parent = resource.getParent();
			if ( parent == null ) // fs root 
				parentMethod = method;
			// recursively go up to the root 
			parentMethod = getMethod(parent, username, role ); 
		} catch (FileSystemException e) {
			// TODO some decent logging
			e.printStackTrace();
		}
		
		
		if ( entry != null ) {
			switch (entry.getType()) {
			case PRIVATE:
				if ( !entry.getOwner().equals(username) ) method = AclMethod.NONE; 
				break;
			case SECURED : 
				// check user permission
				List<AclMethod> userMethods = entry.getUsers().get(username);
				if ( userMethods == null ) { // check the role
					List<AclMethod> roleMethods = entry.getRoles().get(role);
					if ( roleMethods == null || roleMethods.size() == 0 ) {
						// no role nor user acl 
						method = AclMethod.NONE;
					} else { 
						// return the stongest role
						method = AclMethod.max(roleMethods);
					}
				} else { 
					method = AclMethod.max(userMethods);
				}
				
				break;
				default :
					// PUBLIC ACCESS 
					method = AclMethod.WRITE;
					break;
			}
		}
		
		// now, if parent is more restrictive return parent, else return child
		method = AclMethod.min(method, parentMethod);
		
		return method;
	}
	
}

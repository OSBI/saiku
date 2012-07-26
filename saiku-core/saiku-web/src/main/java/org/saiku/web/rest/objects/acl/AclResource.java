package org.saiku.web.rest.objects.acl;

public class AclResource {
	/**
	 * the type of access to the resource.
	 */
	private AclType type = AclType.PUBLIC;
	/**
	 * the read access list
	 */
	private AclList read = null;
	/**
	 * the write access list
	 */
	private AclList write = null;
	/**
	 * the parent resource
	 */
	private AclResource parent = null;

	/**
	 * by default the resource is owned by the public; 
	 * this is done so that we can handle the upgraded instances
	 * of saiku that do not contain an acl.
	 */
	private String owner = AclType.PUBLIC.toString(); 
	/**
	 * checks if the resource can be read by user/role ;
	 * by definition, a resource that can be written can 
	 * also be read, thus the algorithm first checks if the 
	 * resource is explicitly marked as readable;if it is not
	 * then it checks the implicit setting .
	 * 
	 * @param name the user or role accessing the resource
	 * @return true if the parent resource can be read and
	 *  <ul> 
	 *  <li> the owner is accessing the resource </li>
	 *  </ul> 
	 *  <p>or</p>
	 *  <ul>
	 * 	<li>the user/role accessing the resource has been granted access</li>
	 * </ul>
	 */
	public boolean canRead(String name) {
		boolean parentRead = true;
		if (parent != null)
			parentRead = parent.canRead(name);
		if (parentRead) {
			if ( isOwner(name) ) return true; // owner wins ...
			switch (type) {
			case ROLE:
				return (read != null && read.getRoles().contains(name) ) || canWrite(name);
			case USER:
				return read != null && read.getUsers().contains(name) || canWrite(name);
			default:
				return true; // it's public access
			}
		}
		return false; // parent cannot read : overrides 
	}
	
	/**
	 * checks if the resource can be written by user/role   
	 * @param name the user/role accessing the resource
	 * @return
	 * @return true if the parent resource can be written and
	 *  <ul> 
	 *  <li> the owner is accessing the resource </li>
	 *  </ul> 
	 *  <p>or</p>
	 *  <ul>
	 * 	<li>the user/role accessing the resource has been granted access</li>
	 * </ul>
	 */
	public boolean canWrite(String name) {
		boolean parentRead = true;
		if (parent != null)
			parentRead = parent.canWrite(name);
		if (parentRead) {
			if ( isOwner(name) ) return true; // owner wins ...
			switch (type) {
			case ROLE:
				return write != null && write.containsRole(name);
			case USER:
				return write != null && write.containsUser(name);
			default:
				return true; // it's public access
			}
		}
		return false; // parent cannot write : overrides 
	}

	public AclResource getParent() {
		return parent;
	}

	public void setParent(AclResource parent) {
		this.parent = parent;
	}
	/**
	 * Checks if user is owner of the resource
	 * @param user
	 * 
	 * @return true if the resource 
	 * is {@link AclType#PUBLIC} or if the user is actually the one 
	 * who created the resource.
	 */
	public boolean isOwner ( String user ) {
		return AclType.PUBLIC.toString().equals(owner)  || owner.equals(user);
	}
	
	/**
	 * sets the ownership of the resource. If the owner is <pre>null</pre> then 
	 * the resource  owner is set to {@link AclType#PUBLIC}
	 * @param owner
	 */
	public void setOwner(String owner){
		if ( owner == null ) 
			this.owner = AclType.PUBLIC.toString();
		else 
			this.owner = owner;
	}

	public AclType getType() {
		return type;
	}

	public void setType(AclType type) {
		this.type = type;
	}
}


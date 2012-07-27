package org.saiku.web.rest.objects.acl;

import java.util.List;

import org.saiku.web.rest.objects.acl.enumeration.AclType;
import org.saiku.web.rest.objects.acl.exception.InvalidAccessException;

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
	 * the list of users/roles with grant option
	 */
	private AclList grant = null;

	/**
	 * the parent resource
	 */
	private AclResource parent = null;

	/**
	 * by default the resource is owned by the public; this is done so that we
	 * can handle the upgraded instances of saiku that do not contain an acl.
	 */
	private String owner = AclType.PUBLIC.toString();

	/**
	 * checks if the resource can be read by user/role ; by definition, a
	 * resource that can be written can also be read, thus the algorithm first
	 * checks if the resource is explicitly marked as readable;if it is not then
	 * it checks the implicit setting .
	 * 
	 * @param username
	 *            the user or role accessing the resource
	 * @return true if the parent resource can be read and
	 *         <ul>
	 *         <li>the owner is accessing the resource</li>
	 *         </ul>
	 *         <p>
	 *         or
	 *         </p>
	 *         <ul>
	 *         <li>the user/role accessing the resource has been granted access</li>
	 *         </ul>
	 */
	public boolean canRead(String username, List<String> roles) {
		boolean parentRead = true;
		if (parent != null)
			parentRead = parent.canRead(username, roles);
		if (parentRead) {
			if (isOwner(username))
				return true; // owner wins ...
			switch (type) {
			case ROLE:
				boolean canRead = read.containsRole(roles);
				boolean canWrite = canWrite(null, roles);

				// return (read != null && read.getRoles().contains(rolename) )
				// || canWrite(null,rolename);
				return canRead || canWrite;
			case USER:
				return 
						read == null //all users can read 
						|| read.getUsers().contains(username) //the user can read
						|| canWrite(username, roles); // the user can write thus can read
			default:
				return true; // it's public access
			}
		}
		return false; // parent cannot read : overrides
	}

	/**
	 * checks if the resource can be written by user/role
	 * 
	 * @param name
	 *            the user/role accessing the resource
	 * @return
	 * @return true if the parent resource can be written and
	 *         <ul>
	 *         <li>the owner is accessing the resource</li>
	 *         </ul>
	 *         <p>
	 *         or
	 *         </p>
	 *         <ul>
	 *         <li>the user/role accessing the resource has been granted access</li>
	 *         </ul>
	 */
	public boolean canWrite(String name, List<String> roles) {
		boolean parentRead = true;
		if (parent != null)
			parentRead = parent.canRead(name, roles);
		if (parentRead) {
			if (isOwner(name))
				return true; // owner wins ...
			switch (type) {
			case ROLE:
				return 
						(roles != null && roles.size() > 0) && // the user is logged in
						(
							write == null // all roles can write 
							|| 
							write.containsRole(roles) // the specified roles can write
						);
			case USER:
				return 
						name != null // the user is logged in 
						&& 
						(
							write == null // all users can write  
							|| write.containsUser(name) // the user can write
						);
			default:
				return true; // it's public access
			}
		}
		return false; // parent cannot write : overrides
	}

	/**
	 * Checks if the user/role has grant options in the current resource
	 * 
	 * @param username
	 * @param role
	 * @return
	 */
	public boolean canGrant(String username, String role) {
		return userCanGrant(username) || roleCanGrant(role);
	}

	/**
	 * checks if the role has grant option in the current resource. If the
	 * rolename is null the answer is false
	 * 
	 * @param rolename
	 * @return
	 */
	private boolean roleCanGrant(String rolename) {
		if (rolename == null)
			return false;
		return grant.containsRole(rolename) && grant.getRoles().size() != 0;
	}

	/**
	 * Checks if the user has grant option in the current resource. If the
	 * username is null the answer is false
	 * 
	 * @param username
	 * @return
	 */
	private boolean userCanGrant(String username) {
		if (username == null)
			return false;
		if (isOwner(username))
			return true;
		return grant.containsUser(username) && grant.getUsers().size() != 0;
	}

	/**
	 * Checks if user is owner of the resource
	 * 
	 * @param user
	 * 
	 * @return true if the resource is {@link AclType#PUBLIC} or if the user is
	 *         actually the one who created the resource.
	 */
	public boolean isOwner(String user) {
		return AclType.PUBLIC.toString().equals(owner) || owner.equals(user);
	}

	/**
	 * adds a user to the read list
	 * 
	 * @param user
	 */
	public void grantUserRead(String user) {
		if (read == null)
			read = new AclList();
		read.getUsers().add(user);
	}

	/**
	 * adds a user to the write list
	 * 
	 * @param user
	 */
	public void grantUserWrite(String user) {
		if (write == null)
			write = new AclList();
		write.getUsers().add(user);
	}

	/**
	 * adds a role to the read list
	 * 
	 * @param role
	 */
	public void grantRoleRead(String role) {
		if (read == null)
			read = new AclList();
		read.getRoles().add(role);
	}

	/**
	 * adds a role to the write list
	 * 
	 * @param role
	 */
	public void grantRoleWrite(String role) {
		if (write == null)
			write = new AclList();
		write.getRoles().add(role);
	}

	/**
	 * gives a user grant permission
	 * 
	 * @param user
	 */
	public void grantUserGrant(String user) {
		if (grant == null)
			grant = new AclList();
		grant.getRoles().add(user);
	}

	/**
	 * gives a role grant permission
	 * 
	 * @param role
	 */
	public void grantRoleGrant(String role) {
		if (grant == null)
			grant = new AclList();
		grant.getRoles().add(role);
	}

	/**
	 * revokes a user the read permission
	 * 
	 * @param user
	 */
	public void revokeUserRead(String user) {
		read.getUsers().remove(user);
	}

	/**
	 * revokes a user the write permission
	 * 
	 * @param user
	 */
	public void revokeUserWrite(String user) {
		write.getUsers().remove(user);
	}

	/**
	 * revokes a role the read permission
	 * 
	 * @param role
	 */
	public void revokeRoleRead(String role) {
		read.getRoles().remove(role);
	}

	/**
	 * revokes a role the write permission
	 * 
	 * @param role
	 */
	public void revokeRoleWrite(String role) {
		write.getRoles().remove(role);
	}

	/**
	 * revokes a user the grant permission
	 * 
	 * @param user
	 */
	public void revokeUserGrant(String user) {
		grant.getRoles().remove(user);
	}

	/**
	 * revokes a role the grant permission
	 * 
	 * @param role
	 */
	public void revokeRoleGrant(String role) {
		grant.getRoles().remove(role);
	}

	// Getters and setters

	/**
	 * Gets the parent object
	 * 
	 * @return
	 */
	public AclResource getParent() {
		return parent;
	}

	/**
	 * Sets the parent object
	 * 
	 * @param parent
	 */
	public void setParent(AclResource parent) {
		this.parent = parent;
	}

	/**
	 * sets the ownership of the resource. If the owner is
	 * 
	 * <pre>
	 * null
	 * </pre>
	 * 
	 * then the resource owner is set to {@link AclType#PUBLIC}
	 * 
	 * @param owner
	 */
	public void setOwner(String owner) {
		if (!this.owner.equals(AclType.PUBLIC.toString())) {
			// remove from grant
			grant.getUsers().remove(this.owner);
		}
		if (owner == null)
			this.owner = AclType.PUBLIC.toString();
		else {
			this.owner = owner;
			grantUserGrant(this.owner);
		}
	}

	/**
	 * returns the acl type
	 * 
	 * @return
	 */
	public AclType getType() {
		return type;
	}

	/**
	 * sets the acl type.
	 * 
	 * @param type
	 * @throws InvalidAccessException
	 *             if {@link AclType} is {@link AclType#GRANT}
	 */
	public void setType(AclType type) {
		if (type == AclType.GRANT)
			throw new InvalidAccessException(
					"GRANT is not supported for Acl resource type");
		this.type = type;
	}

	public AclList getRead() {
		return read;
	}

	public void setRead(AclList read) {
		this.read = read;
	}

	public AclList getWrite() {
		return write;
	}

	public void setWrite(AclList write) {
		this.write = write;
	}

	public AclList getGrant() {
		return grant;
	}

	public void setGrant(AclList grant) {
		this.grant = grant;
	}

	public String getOwner() {
		return owner;
	}

}

package bi.meteorite.api;

import java.util.List;

public interface Users {

	
	SaikuUser addUser(SaikuUser u);
	
	boolean deleteUser(SaikuUser u);
	
	SaikuUser setUser(SaikuUser u);
	
	List<SaikuUser> getUsers();
	
	SaikuUser getUser(int id);
	
	String[] getRoles(SaikuUser u);
	
	void addRole(SaikuUser u);
	
	void removeRole(SaikuUser u);
	
	void removeUser(String username);
	
	void updateUser(SaikuUser u);
	
	boolean isAdmin();
	
	void checkFolders();
	
	List<String> getAdminRoles();
}

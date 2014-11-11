package org.saiku.repository;

import org.apache.commons.lang.StringUtils;
import org.apache.jackrabbit.commons.JcrUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

import javax.jcr.Node;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;

/**
 * Created by bugg on 24/06/14.
 */
public class Acl2 {

    private static final Logger log = LoggerFactory.getLogger(Acl2.class);

    private List<String> adminRoles;

    public void setAdminRoles( List<String> adminRoles ) {
        this.adminRoles = adminRoles;
    }

    private AclMethod rootMethod = AclMethod.WRITE;

    private Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();

    public Acl2(Node root){
        readAclTree(root);
    }
    /**
     * Returns the access method to the specified resource for the user or role
     *
     * @param node the resource to which you want to access
     * @param username the username of the user that's accessing
     * @param roles    the role of the user that's accessing
     * @return
     */
    public List<AclMethod> getMethods( Node node, String username, List<String> roles ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            //log.debug("Set ACL to " + object + " : " + acl);
            //String acl = null;
            AclEntry entry = null;
            Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();

            try {

                acl = (Map<String, AclEntry>) mapper.readValue( node.getProperty("owner").getString(), TypeFactory
                        .mapType(HashMap.class, String.class, AclEntry.class) );
               // mapper.readValue(acl, AclEntry.class);
                Map.Entry<String, AclEntry> e = acl.entrySet().iterator().next();
                entry = e.getValue();
            }
            catch (PathNotFoundException e){
                log.debug("Path(owner) not found: "+node.getPath(), e.getCause());
            }
            catch (Exception e ){
                log.debug("Exception: " + node.getPath(), e.getCause());
            }
            AclMethod method;

            if ( node.getPath().startsWith("..") ) {
                return getAllAcls( AclMethod.NONE );
            }
            if ( isAdminRole( roles ) ) {
                return getAllAcls( AclMethod.GRANT );
            }
            if ( entry != null ) {
                switch( entry.getType() ) {
                    case PRIVATE:
                        if ( !entry.getOwner().equals( username ) ) {
                            method = AclMethod.NONE;
                        } else {
                            method = AclMethod.GRANT;
                        }
                        break;
                    case SECURED:
                        // check user permission
                        List<AclMethod> allMethods = new ArrayList<AclMethod>();

                        if ( StringUtils.isNotBlank(entry.getOwner()) && entry.getOwner().equals( username ) ) {
                            allMethods.add( AclMethod.GRANT );

                        }
                        List<AclMethod> userMethods =
                                entry.getUsers() != null && entry.getUsers().containsKey( username )
                                        ? entry.getUsers().get( username ) : new ArrayList<AclMethod>();

                        List<AclMethod> roleMethods = new ArrayList<AclMethod>();
                        for ( String role : roles ) {
                            List<AclMethod> r =
                                    entry.getRoles() != null && entry.getRoles().containsKey( role )
                                            ? entry.getRoles().get( role ) : new ArrayList<AclMethod>();
                            roleMethods.addAll( r );
                        }

                        allMethods.addAll( userMethods );
                        allMethods.addAll( roleMethods );

                        if ( allMethods.size() == 0 ) {
                            // no role nor user acl
                            method = AclMethod.NONE;
                        } else {
                            // return the strongest role
                            method = AclMethod.max( allMethods );
                        }

                        break;
                    default:
                        // PUBLIC ACCESS
                        method = AclMethod.WRITE;
                        break;
                }
            } else {


        if ( node.getParent() == null ) {
          method = AclMethod.NONE;
        } else if ( node.getParent().getName().equals("/") ) {
          return getAllAcls( rootMethod );
        } else {
          Node parent = node.getParent();

          List<AclMethod> parentMethods = getMethods( parent, username, roles );
          method = AclMethod.max( parentMethods );
        }
            }
          //  String parentPath = repoRoot
            return getAllAcls( method );
        } catch ( Exception e ) {
            log.debug("Error", e.getCause());
        }
        List<AclMethod> noMethod = new ArrayList<AclMethod>();
        noMethod.add( AclMethod.NONE );
        return noMethod;
    }


    public void setRootAcl( String rootAcl ) {
        try {
            if ( StringUtils.isNotBlank( rootAcl ) ) {
                rootMethod = AclMethod.valueOf( rootAcl );
            }
        } catch ( Exception e ) {
        }
    }


    private List<AclMethod> getAllAcls( AclMethod maxMethod ) {
        List<AclMethod> methods = new ArrayList<AclMethod>();
        if ( maxMethod != null ) {
            for ( AclMethod m : AclMethod.values() ) {
                if ( m.ordinal() > 0 && m.ordinal() <= maxMethod.ordinal() ) {
                    methods.add( m );
                }
            }
        }
        return methods;
    }

    public boolean canGrant( Node node, String username, List<String> roles ) {
        List<AclMethod> acls = getMethods( node, username, roles );
        return acls.contains( AclMethod.GRANT );
    }

    public void addEntry(String path, AclEntry entry) {
        try {
            if (entry != null) {
                acl.put(path, entry);
//writeAcl( path, entry );
            }
        } catch (Exception e) {
//logger.error( "Cannot add entry for resource: " + path, e );
        }
    }



    public Node serialize(Node node) {
    try {
      ObjectMapper mapper = new ObjectMapper();
      node.setProperty("owner", "");
      node.setProperty("owner", mapper.writeValueAsString(acl));
      return node;
    } catch (Exception e) {
      try {
        log.debug("Error while reading ACL files at path: " + node.getPath(), e.getCause());
      } catch (RepositoryException e1) {
        log.debug("Repository Exception", e1.getCause());
      }
    }
    return node;
  }

    private Map<String, AclEntry> deserialize(Node node) {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, AclEntry> acl = new TreeMap<String, AclEntry>();
        try {
            if (node != null && node.getProperty("owner") != null) {
                acl = mapper.readValue(node.getProperty("owner").getString(), TypeFactory
                    .mapType(HashMap.class, String.class, AclEntry.class));
            }
        } catch (Exception e) {
            try {
                log.debug("Error while reading ACL files at path: " + node.getPath(), e.getCause());
            } catch (RepositoryException e1) {
                log.debug("Repository Exception", e1.getCause());
            }
        }
        return acl;
    }

    public AclEntry getEntry( String path ) {
        return ( acl.containsKey( path ) ? acl.get( path ) : null );
    }

    public boolean canRead( Node path, String username, List<String> roles ) {
        if ( path == null ) {
            return false;
        }
        List<AclMethod> acls = getMethods( path, username, roles );
        return acls.contains( AclMethod.READ );
    }

    public boolean canWrite( Node path, String username, List<String> roles ) {
        if ( path == null ) {
            return false;
        }
        List<AclMethod> acls = getMethods( path, username, roles );
        return acls.contains( AclMethod.WRITE );
    }


    private void readAclTree( Node resource ) {
        try {

            String s = resource.getPrimaryNodeType().getName();
            Node folder = resource;
                    //resource.getPrimaryNodeType().getName().equals( "nt:folder" )
                    //        ? resource : resource.getParent();

            String jsonFile = folder.getProperty("owner").getString();

            if ( jsonFile != null && jsonFile != "" ) {
                Map<String, AclEntry> folderAclMap = deserialize(folder);
                Map<String, AclEntry> aclMap = new TreeMap<String, AclEntry>();

                for (String key : folderAclMap.keySet()) {
                    if (key.equals(folder.getPath())) {
                        AclEntry entry = folderAclMap.get(key);
                        //FileName fn = folder.resolveFile( key ).getName();
                        //String childPath = repoRoot.getName().getRelativeName( fn );
                        aclMap.put(folder.getPath(), entry);
                    }

                    acl.putAll(aclMap);
                }

                for (Node file : JcrUtils.getChildNodes(folder)) {
                    //if ( file.getPrimaryNodeType().equals( "nt:folder" ) ) {
                    readAclTree(file);
                    //}
                }
            }
        }
        catch ( Exception e ) {

            try {
                log.debug("Error while reading ACL files at path: "+resource.getPath(), e.getCause());
            } catch (RepositoryException e1) {
                log.debug("Repository Exception", e1.getCause());
            }

        }
    }

    /**
     * Returns the list of the administrator roles
     *
     * @return
     */
    public List<String> getAdminRoles() {
        return adminRoles;
    }

    /**
     * Checks if a specific role is in the list of the admin roles
     *
     * @param role
     * @return
     */
    private boolean isAdminRole( String role ) {
        return adminRoles.contains( role );
    }

    /**
     * Checks if a list of roles contains an admin role
     *
     * @param roles
     * @return
     */
    private boolean isAdminRole( List<String> roles ) {
        for ( String role : roles ) {
            if ( isAdminRole( role ) ) {
                return true;
            }
        }
        return false;
    }

}

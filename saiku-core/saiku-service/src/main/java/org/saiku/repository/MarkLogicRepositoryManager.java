package org.saiku.repository;

import com.marklogic.xcc.*;
import com.marklogic.xcc.exceptions.RequestException;
import com.marklogic.xcc.exceptions.XccConfigException;
import org.apache.commons.lang3.text.StrSubstitutor;
import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.service.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MarkLogic Repository Manager
 */
public class MarkLogicRepositoryManager implements IRepositoryManager {
  private static final Logger log = LoggerFactory.getLogger(MarkLogicRepositoryManager.class);

  // Which parameters do I need:
  // 1. Host
  // 2. Port
  // 3. Username
  // 4. Password
  // 5. Database

  private String host = "localhost";
  private int port = 8006;
  private String username = "admin";
  private String password = "bruunoo";
  private String database = "orbis";

  private String connectionUrl;
  private ContentSource contentSource;

  private UserService userService;

  @Override
  public void init() {
    Map<String, String> values = new HashMap<>();

    values.put("host", host);
    values.put("port", Integer.toString(port));
    values.put("username", username);
    values.put("password", password);
    values.put("database", database);

    StrSubstitutor sub = new StrSubstitutor(values, "%(", ")");

    connectionUrl = sub.replace("xcc://%(username):%(password)@%(host):%(port)/%(database)");

    connect();
  }

  @Override
  public boolean start(UserService userService) throws RepositoryException {
    this.userService = userService;
    return true;
  }

  @Override
  public void createUser(String u) throws RepositoryException {
    createFolder("/homes/" + u + "/");
  }

  @Override
  public Object getHomeFolders() throws RepositoryException {
    return getFilesFromFolder("/homes/");
  }

  @Override
  public Object getHomeFolder(String directory) throws RepositoryException {
    return getFilesFromFolder("/homes/" + directory);
  }

  @Override
  public Object getFolder(String user, String directory) throws RepositoryException {
    return getFilesFromFolder("/homes/" + user + "/" + directory + "/");
  }

  @Override
  public void shutdown() {
  }

  @Override
  public boolean createFolder(String username, String folder) throws RepositoryException {
    createFolder("/homes/" + username + "/" + folder + "/");
    return true;
  }

  @Override
  public boolean deleteFolder(String folder) throws RepositoryException {
    Session session = createUpdateSession();

    AdhocQuery request = session.newAdhocQuery("xdmp:directory-delete(\"" + folder + "\")");

    try {
      session.submitRequest(request);
      session.commit();
    } catch (RequestException e) {
      log.error("Error while trying to delete a folder", e);
      throw new RepositoryException(e);
    } finally {
      session.close();
    }

    return true;
  }

  @Override
  public void deleteRepository() throws RepositoryException {

  }

  @Override
  public boolean moveFolder(String user, String folder, String source, String target) throws RepositoryException {
    return true;
  }

  @Override
  public Object saveFile(Object file, String path, String user, String type, List<String> roles) throws RepositoryException {
    if (file == null) { // Create a folder
      createFolder(user, path);
    } else { // Write a file to an existing folder
      Session session = createUpdateSession();

      AdhocQuery request = session.newAdhocQuery(
          "xdmp:document-insert(\"/homes/" + user + "/" + path + "\", " +
          "text {" + escapeForJava((String)file, true) + "})");

      try {
        session.submitRequest(request);
        session.commit();

        return new File("/homes/" + user + "/" + path);
      } catch (RequestException e) {
        log.error("Error while trying to save a file", e);
        throw new RepositoryException(e);
      } finally {
        session.close();
      }

    }

    return null;
  }

  @Override
  public void removeFile(String path, String user, List<String> roles) throws RepositoryException {

  }

  @Override
  public void moveFile(String source, String target, String user, List<String> roles) throws RepositoryException {

  }

  @Override
  public Object saveInternalFile(Object file, String path, String type) throws RepositoryException {
    return null;
  }

  @Override
  public Object saveBinaryInternalFile(InputStream file, String path, String type) throws RepositoryException {
    return null;
  }

  @Override
  public String getFile(String s, String username, List<String> roles) throws RepositoryException {
    return null;
  }

  @Override
  public String getInternalFile(String s) throws RepositoryException {
    return null;
  }

  @Override
  public InputStream getBinaryInternalFile(String s) throws RepositoryException {
    return null;
  }

  @Override
  public void removeInternalFile(String s) throws RepositoryException {

  }

  @Override
  public List<MondrianSchema> getAllSchema() throws RepositoryException {
    return null;
  }

  @Override
  public List<DataSource> getAllDataSources() throws RepositoryException {
    return null;
  }

  @Override
  public void saveDataSource(DataSource ds, String path, String user) throws RepositoryException {

  }

  @Override
  public byte[] exportRepository() throws RepositoryException, IOException {
    return new byte[0];
  }

  @Override
  public void restoreRepository(byte[] xml) throws RepositoryException, IOException {

  }

  @Override
  public RepositoryFile getFile(String fileUrl) {
    return null;
  }

  @Override
  public List<IRepositoryObject> getAllFiles(List<String> type, String username, List<String> roles) {
    return null;
  }

  @Override
  public List<IRepositoryObject> getAllFiles(List<String> type, String username, List<String> roles, String path) throws RepositoryException {
    return null;
  }

  @Override
  public void deleteFile(String datasourcePath) {

  }

  @Override
  public AclEntry getACL(String object, String username, List<String> roles) {
    return null;
  }

  @Override
  public void setACL(String object, String acl, String username, List<String> roles) throws RepositoryException {

  }

  @Override
  public List<MondrianSchema> getInternalFilesOfFileType(String type) throws RepositoryException {
    return null;
  }

  @Override
  public void createFileMixin(String type) throws RepositoryException {

  }

  @Override
  public Object getRepositoryObject() {
    return null;
  }

  private void connect() {
    try {
      URI uri = new URI(connectionUrl);
      contentSource = ContentSourceFactory.newContentSource (uri);
    } catch (URISyntaxException e) {
      log.error("Incorrect URI syntax: " + connectionUrl, e);
      throw new RuntimeException(e);
    } catch (XccConfigException e) {
      log.error("Wrong XCC configuration", e);
      throw new RuntimeException(e);
    }
  }

  private File[] getFilesFromFolder(String path) throws RepositoryException {
    Session session = contentSource.newSession();
    AdhocQuery request = session.newAdhocQuery("xdmp:directory(\""+ path + "\", \"1\")");

    try {
      ResultSequence rs = session.submitRequest(request);
      File[] folders = new File[rs.size()];

      int i = 0;
      while(rs.hasNext()) {
        folders[i++] = new File(rs.next().getDocumentURI());
      }

      return folders;
    } catch (RequestException e) {
      log.error("Error while trying to fetch the home folders", e);
      throw new RepositoryException(e);
    } finally {
      session.close();
    }
  }

  private void createFolder(String path) throws RepositoryException {
    Session session = createUpdateSession();
    AdhocQuery request = session.newAdhocQuery("xdmp:directory-create(\"" + path + "\")");

    try {
      session.submitRequest(request);
      session.commit();
    } catch (RequestException e) {
      log.error("Error while trying to create a folder", e);
      throw new RepositoryException(e);
    } finally {
      session.close();
    }
  }

  private Session createUpdateSession() {
    Session session = contentSource.newSession();
    session.setTransactionMode(Session.TransactionMode.UPDATE);
    return session;
  }

  private String escapeForJava( String value, boolean quote) {
    StringBuilder builder = new StringBuilder();

    if (quote) {
      builder.append("\"");
    }

    for (char c : value.toCharArray()) {
      if(c == '\'')
        builder.append( "\\'" );
      else if (c == '\"')
        builder.append( "\\\"" );
      else if(c == '\r')
        builder.append( "\\r" );
      else if(c == '\n')
        builder.append( "\\n" );
      else if(c == '\t')
        builder.append( "\\t" );
      else if(c < 32 || c >= 127)
        builder.append(String.format( "\\u%04x", (int)c));
      else
        builder.append(c);
    }

    if (quote) {
      builder.append("\"");
    }

    return builder.toString();
  }
}

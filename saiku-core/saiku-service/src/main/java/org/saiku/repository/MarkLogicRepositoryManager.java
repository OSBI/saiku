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
import java.io.*;
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

  private static final String[] PARAMETER_DELIMITER = new String[]{"%(", ")"};
  private static final String HOMES_DIRECTORY = "/homes/";

  // Which parameters do I need:
  // 1. Host
  // 2. Port
  // 3. Username
  // 4. Password
  // 5. Database
  private String host = "localhost";
  private int port = 8070;
  private String username = "admin";
  private String password = "bruunoo";
  private String database = "saiku";

  private String connectionUrl;
  private ContentSource contentSource;

  private UserService userService;

  @Override
  public void init() {
    Map<String, String> values = ParamsMap.init()
        .put("host", host)
        .put("port", Integer.toString(port))
        .put("username", username)
        .put("password", password)
        .put("database", database).build();

    StrSubstitutor sub = createStrSubstitutor(values);

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
    createFolder(HOMES_DIRECTORY + u + "/");
  }

  @Override
  public Object getHomeFolders() throws RepositoryException {
    return getFilesFromFolder(HOMES_DIRECTORY);
  }

  @Override
  public Object getHomeFolder(String directory) throws RepositoryException {
    return getFilesFromFolder(HOMES_DIRECTORY + directory);
  }

  @Override
  public Object getFolder(String user, String directory) throws RepositoryException {
    return getFilesFromFolder(HOMES_DIRECTORY + user + "/" + directory + "/");
  }

  @Override
  public void shutdown() {
  }

  @Override
  public boolean createFolder(String username, String folder) throws RepositoryException {
    createFolder(HOMES_DIRECTORY + username + "/" + folder + "/");
    return true;
  }

  @Override
  public boolean deleteFolder(String folder) throws RepositoryException {
    executeUpdate("xdmp:directory-delete('%(folder)')", ParamsMap.init().put("folder", folder).build());
    return true;
  }

  @Override
  public void deleteRepository() throws RepositoryException {

  }

  @Override
  public boolean moveFolder(String user, String folder, String source, String target) throws RepositoryException {
    /* TODO - MarkLogic doest not support moving directories or documents, instead you should create another directory
       and document with the same content, with another name, and delete the old directory/document. */
    return true;
  }

  @Override
  public Object saveFile(Object file, String path, String user, String type, List<String> roles) throws RepositoryException {
    if (file == null) { // Create a folder
      createFolder(user, path);
    } else { // Write a file to an existing folder
      Map<String, String> params = ParamsMap.init()
          .put("user", user)
          .put("path", path)
          .put("text", escapeForJava((String)file, true)).build();

      executeUpdate("xdmp:document-insert('" + HOMES_DIRECTORY + "%(user)/%(path)', text {%(text)})", params);

      return new File(HOMES_DIRECTORY + user + "/" + path);
    }

    return null;
  }

  @Override
  public void removeFile(String path, String user, List<String> roles) throws RepositoryException {
    Map<String, String> params = ParamsMap.init().put("doc_uri", HOMES_DIRECTORY + user + "/" + path).build();
    executeUpdate("xdmp:document-delete('%(doc_uri)')", params);
  }

  @Override
  public void moveFile(String source, String target, String user, List<String> roles) throws RepositoryException {
    /* TODO - MarkLogic doest not support moving directories or documents, instead you should create another directory
       and document with the same content, with another name, and delete the old directory/document. */
  }

  @Override
  public Object saveInternalFile(Object file, String path, String type) throws RepositoryException {
    if (file == null) { // Create a folder
      createFolder(path);
    } else { // Write a file to an existing folder
      Map<String, String> params = ParamsMap.init()
          .put("path", path)
          .put("text", escapeForJava((String)file, true)).build();

      executeUpdate("xdmp:document-insert('%(path)', text {%(text)})", params);

      return new File(path);
    }

    return null;
  }

  @Override
  public Object saveBinaryInternalFile(InputStream file, String path, String type) throws RepositoryException {
    ByteArrayOutputStream output = new ByteArrayOutputStream();

    int length;
    byte[] buffer = new byte[1024];

    try {
      while ((length = file.read(buffer)) != -1) {
        output.write(buffer, 0, length);
      }

      String data = new String(output.toByteArray(), "UTF-8");

      return saveInternalFile(data, path, type);
    } catch (IOException ex) {
      log.error("Error while trying to save the file", ex);
      throw new RepositoryException(ex);
    }
  }

  @Override
  public String getFile(String s, String username, List<String> roles) throws RepositoryException {
    Session session = contentSource.newSession();

    RequestOptions options = new RequestOptions();
    options.setCacheResult(false); // stream by default

    AdhocQuery request = session.newAdhocQuery("doc('" + s + "')", options);

    try {
      ResultSequence rs = session.submitRequest(request);
      ResultItem item = rs.next();

      if (item == null) {
        throw new RepositoryException("No document found with URI '" + s + "'");
      }

      StringWriter writer = new StringWriter();
      item.writeTo(writer);

      return writer.toString();
    } catch (RequestException e) {
      log.error("Error whilte trying to fetch the file " + s, e);
      throw new RepositoryException(e);
    } catch (IOException e) {
      log.error("Error whilte trying to fetch the file " + s, e);
      throw new RepositoryException(e);
    }
  }

  @Override
  public String getInternalFile(String s) throws RepositoryException {
    return getFile(s, null, null);
  }

  @Override
  public InputStream getBinaryInternalFile(String s) throws RepositoryException {
    return new ByteArrayInputStream(getInternalFile(s).getBytes());
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
    AdhocQuery request = session.newAdhocQuery("cts:uris()[matches(., '^" + path + ".+/$')]");

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
    executeUpdate("xdmp:directory-create('%(path)')", ParamsMap.init().put("path", path).build());
  }

  private Session createUpdateSession() {
    Session session = contentSource.newSession();
    session.setTransactionMode(Session.TransactionMode.UPDATE);
    return session;
  }

  private void executeUpdate(String update, Map<String, String> parameters) throws RepositoryException {
    executeUpdate(update, parameters, null);
  }

  private void executeUpdate(String update, Map<String, String> parameters, String errorMsg) throws RepositoryException {
    Session session = createUpdateSession();

    AdhocQuery request = null;

    if (parameters != null) {
      StrSubstitutor sub = createStrSubstitutor(parameters);
      request = session.newAdhocQuery(sub.replace(update));
    } else {
      request = session.newAdhocQuery(update);
    }

    try {
      session.submitRequest(request);
      session.commit();
    } catch (RequestException e) {
      log.error(errorMsg != null ? errorMsg : "Error on update", e);
      throw new RepositoryException(e);
    } finally {
      session.close();
    }
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

  private static StrSubstitutor createStrSubstitutor(Map<String, String> values) {
    return new StrSubstitutor(values, PARAMETER_DELIMITER[0], PARAMETER_DELIMITER[1]);
  }

  private static class ParamsMap {
    private Map<String, String> params;

    private ParamsMap() {
      params = new HashMap<>();
    }

    public static ParamsMap init() {
      return new ParamsMap();
    }

    public ParamsMap put(String key, String value) {
      params.put(key, value);
      return this;
    }

    public Map<String, String> build() {
      return params;
    }
  }
}

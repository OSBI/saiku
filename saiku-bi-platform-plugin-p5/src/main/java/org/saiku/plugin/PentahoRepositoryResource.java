package org.saiku.plugin;

import org.apache.commons.io.IOUtils;

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.plugin.util.ResourceManager;
import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.importer.JujuSource;
import org.saiku.service.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.List;
import java.util.Map;

import javax.jcr.RepositoryException;
import javax.xml.bind.DatatypeConverter;

import pt.webdetails.cpf.repository.api.FileAccess;
import pt.webdetails.cpf.repository.api.IBasicFile;
import pt.webdetails.cpf.repository.api.IContentAccessFactory;
import pt.webdetails.cpf.repository.api.IUserContentAccess;

/**
 * Created by bugg on 17/11/14.
 */
public class PentahoRepositoryResource implements IDatasourceManager {
  @Autowired
  private IContentAccessFactory contentAccessFactory;
  public void load() {

  }

  public void unload() {

  }

  public SaikuDatasource addDatasource(SaikuDatasource datasource) throws Exception {
    return null;
  }

  public SaikuDatasource setDatasource(SaikuDatasource datasource) throws Exception {
    return null;
  }

  public List<SaikuDatasource> addDatasources(List<SaikuDatasource> datasources) {
    return null;
  }

  public boolean removeDatasource(String datasourceName) {
    return false;
  }

  public boolean removeSchema(String schemaName) {
    return false;
  }

  public Map<String, SaikuDatasource> getDatasources() {
    return null;
  }

  public SaikuDatasource getDatasource(String datasourceName) {
    return null;
  }

  @Override
  public SaikuDatasource getDatasource(String datasourceName, boolean refresh) {
    return null;
  }

  public void addSchema(String file, String path, String name) throws Exception {

  }

  public List<MondrianSchema> getMondrianSchema() {
    return null;
  }

  public MondrianSchema getMondrianSchema(String catalog) {
    return null;
  }

  public RepositoryFile getFile(String file) {
    return null;
  }

  public String getFileData(String file, String username, List<String> roles) {
    return null;
  }

  public String getInternalFileData(String file) throws RepositoryException {
    if(file.contains("/home")){
      IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);
      if( !access.fileExists(file) && access.hasAccess(file, FileAccess.READ)) {
        //log.error("Access to Repository has failed File does not exist: " + file);
        throw new NullPointerException("Access to Repository has failed");
      }
      IBasicFile bf = access.fetchFile(file);

      try {
        return (String) objFromString(IOUtils.toString(bf.getContents()));
      } catch (IOException | ClassNotFoundException e) {
        e.printStackTrace();
      }
    }
    else{
      ResourceManager rm = new ResourceManager();
      try {
        return rm.getAbsoluteEncodedResourceAsString(System.getProperty("user.home")+"/.pentaho/"+file, null);
      } catch (IOException e1) {
        try {
          return rm.getEncodedResourceAsString(file, null);
        } catch (IOException e) {
          //

        }
      }

    }

    return null;
  }

  public InputStream getBinaryInternalFileData(String file) throws RepositoryException {
    IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);

    if( !access.fileExists(file) && access.hasAccess(file, FileAccess.READ)) {
      //log.error("Access to Repository has failed File does not exist: " + file);
      throw new NullPointerException("Access to Repository has failed");
    }
    IBasicFile bf = access.fetchFile(file);

    try {
      Object o= objFromString(IOUtils.toString(bf.getContents()));
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      ObjectOutputStream oos = new ObjectOutputStream(baos);


      oos.writeObject(o);

      oos.flush();
      oos.close();

      return new ByteArrayInputStream(baos.toByteArray());
    } catch (Exception e) {
      throw new RepositoryException("No data: " + e.getLocalizedMessage());
    }
  }

  public String saveFile(String path, Object content, String user, List<String> roles) {
    return null;
  }

  public String saveFile(String path, String content, String user, List<String> roles) {
    return null;
  }

  public String removeFile(String path, String user, List<String> roles) {
    return null;
  }

  public String moveFile(String source, String target, String user, List<String> roles) {
    return null;
  }

  public String saveInternalFile(String path, Object content, String type) {

    IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);

    try {
      String s = objToString(content);

      access.saveFile(path, IOUtils.toInputStream(s));
      return "Save Okay";
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
  private static Object objFromString( String s ) throws IOException ,
      ClassNotFoundException {
    byte [] data = DatatypeConverter.parseBase64Binary(s);
    ObjectInputStream ois = new ObjectInputStream(
        new ByteArrayInputStream(  data ) );
    Object o  = ois.readObject();
    ois.close();
    return o;
  }

  /** Write the object to a Base64 string.
   * @param o*/
  private static String objToString( Object o ) throws IOException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream( baos );
    oos.writeObject( o );
    oos.close();

    return DatatypeConverter.printBase64Binary(baos.toByteArray());
  }
  public String saveBinaryInternalFile(String path, InputStream content, String type) {

    IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);

    access.saveFile(path, content);
    return "Save Okay";

  }

  public String saveInternalFile(String path, String content, String type) {
    return null;
  }

  public void removeInternalFile(String filePath) {

  }

  public List<IRepositoryObject> getFiles(List<String> type, String username, List<String> roles) {
    return null;
  }

  public List<IRepositoryObject> getFiles(List<String> type, String username, List<String> roles, String path) {
    return null;
  }


  public void createUser(String user) {

  }

  public void deleteFolder(String folder) {

  }

  public AclEntry getACL(String object, String username, List<String> roles) {
    return null;
  }

  public void setACL(String object, String acl, String username, List<String> roles) {

  }

  public void setUserService(UserService userService) {

  }

  public List<MondrianSchema> getInternalFilesOfFileType(String type) {
    return null;
  }

  public void createFileMixin(String type) throws RepositoryException {

  }

  public byte[] exportRepository() {
    return new byte[0];
  }

  public void restoreRepository(byte[] data) {

  }

  public boolean hasHomeDirectory(String name) {
    return false;
  }

  public void restoreLegacyFiles(byte[] data) {

  }

  public String getFoodmartschema() {
    return null;
  }

  public void setFoodmartschema(String schema) {

  }

  public void setFoodmartdir(String dir) {

  }

  public String getFoodmartdir() {
    return null;
  }

  public String getDatadir() {
    return null;
  }

  public void setDatadir(String dir) {

  }

  public void setFoodmarturl(String foodmarturl) {

  }

  public String getFoodmarturl() {
    return null;
  }
  public String getEarthquakeUrl(){
    return null;
  }

  public String getEarthquakeDir(){
    return null;
  }

  public String getEarthquakeSchema(){
    return null;
  }

  public void setEarthquakeUrl(String earthquakeUrl){

  }

  public void setEarthquakeDir(String earthquakeDir){

  }

  public void setEarthquakeSchema(String earthquakeSchema){

  }

  @Override
  public void setExternalPropertiesFile(String file) {

  }

  @Override
  public String[] getAvailablePropertiesKeys() {
    return new String[0];
  }

  @Override
  public List<JujuSource> getJujuDatasources() {
    return null;
  }

  /*public List<JujuSource> getJujuDatasources() {
    return null;
  }*/
}

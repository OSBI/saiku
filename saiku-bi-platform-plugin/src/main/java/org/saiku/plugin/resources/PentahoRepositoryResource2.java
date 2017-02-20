/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.plugin.resources;

import org.saiku.plugin.util.PluginConfig;
import org.saiku.repository.AclMethod;
import org.saiku.repository.IRepositoryObject;
import org.saiku.repository.RepositoryFileObject;
import org.saiku.repository.RepositoryFolderObject;
import org.saiku.web.rest.resources.ISaikuRepository;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.dom4j.Document;
import org.dom4j.Node;
import org.dom4j.io.DOMReader;
import org.pentaho.platform.api.engine.ICacheManager;
import org.pentaho.platform.api.engine.IPentahoAclEntry;
import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.engine.ISolutionFile;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.api.repository.ISolutionRepositoryService;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.security.SecurityHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.parsers.ParserConfigurationException;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 *
 * @author Paul Stoellberger
 */
@Component
@Path("/saiku/{username}/repository")
@XmlAccessorType(XmlAccessType.NONE)
public class PentahoRepositoryResource2 implements ISaikuRepository {

  private static final Logger log = LoggerFactory.getLogger(PentahoRepositoryResource2.class);

  private static final String CACHE_REPOSITORY_DOCUMENT = "CDF_REPOSITORY_DOCUMENT";
  IPentahoSession userSession;
  ICacheManager cacheManager;

  boolean cachingAvailable;

  private ISolutionRepository repository;

  public PentahoRepositoryResource2() {

    cacheManager = PentahoSystem.getCacheManager(userSession);
    cachingAvailable = cacheManager != null && cacheManager.cacheEnabled();
    userSession = PentahoSessionHolder.getSession();
    repository = PentahoSystem.get(ISolutionRepository.class, userSession);

  }

  private Document getRepositoryDocument(final IPentahoSession userSession) throws ParserConfigurationException {      //
    Document repositoryDocument;
    if (cachingAvailable && (repositoryDocument = (Document) cacheManager.getFromSessionCache(userSession, CACHE_REPOSITORY_DOCUMENT)) != null) {
      log.debug("Repository Document found in cache");
      return repositoryDocument;
    } else {
      //System.out.println(Calendar.getInstance().getTime() + ": Getting repository Document");
      final DOMReader reader = new DOMReader();
      repositoryDocument = reader.read(PentahoSystem.get(ISolutionRepositoryService.class, userSession).getSolutionRepositoryDoc(userSession, new String[0]));
      //repositoryDocument = reader.read(new SolutionRepositoryService().getSolutionRepositoryDoc(userSession, new String[0]));
      cacheManager.putInSessionCache(userSession, CACHE_REPOSITORY_DOCUMENT, repositoryDocument);
      //System.out.println(Calendar.getInstance().getTime() + ": Repository Document Returned");
    }
    return repositoryDocument;
  }


  /**
   * Get Saved Queries.
   *
   * @return A list of SavedQuery Objects.
   */
  @GET
  @Produces({"application/json"})
  public List<IRepositoryObject> getRepository(
      @QueryParam("path") String path,
      @QueryParam("type") String type) {
    List<IRepositoryObject> objects = new ArrayList<IRepositoryObject>();
    try {
      if (path != null && (path.startsWith("/") || path.startsWith("."))) {
        throw new IllegalArgumentException("Path cannot be null or start with \"/\" or \".\" - Illegal Path: " + path);
      }
      userSession = PentahoSessionHolder.getSession();
      repository = PentahoSystem.get(ISolutionRepository.class, userSession);
      if (StringUtils.isNotBlank(path)) {
        ISolutionFile sf = repository.getSolutionFile(path, ISolutionRepository.ACTION_EXECUTE);
        if (sf != null && !sf.isDirectory() && (StringUtils.isBlank(type) || sf.getExtension().endsWith(type.toLowerCase()))) {
          List<AclMethod> acls = getAcl(path, false);
          String localizedName = repository.getLocalizedFileProperty(sf, "title", ISolutionRepository.ACTION_EXECUTE); //$NON-NLS-1$
          objects.add(new RepositoryFileObject(localizedName, "#" + path, type, path, acls));
          return objects;
        }
      }
      Document navDoc = getRepositoryDocument(PentahoSessionHolder.getSession());
      Node tree = navDoc.getRootElement();
// List nodes = tree.selectNodes("./file[@name='project']/file[@name='common']");
      String context = null;
      if (StringUtils.isNotBlank(path)) {
        String rootNodePath = ".";
        String[] parts = path.split("/");
        for (String part : parts) {
          rootNodePath += "/file[@name='" + part + "']";
        }
        tree = tree.selectSingleNode(rootNodePath);
        if (tree == null) {
          throw new Exception("Cannot find root folder with path: " + rootNodePath);
        }
        path = StringUtils.join(parts, "/");
        context = path;
      } else {
        context = "";
      }

      List<IRepositoryObject> resultList = new ArrayList<>();
      String[] typeArray = type == null ? new String[]{""} : type.split(","); // The types may be comma separated
      for (String t : typeArray) {
        resultList.addAll(processTree(tree, context, t));
      }

      return resultList;
    } catch (Exception e) {
      log.error(this.getClass().getName(), e);
      e.printStackTrace();
    }
    return objects;
  }


  /**
   * Load a resource.
   *
   * @param file - The name of the repository file to load.
   * @param path - The path of the given file to load.
   * @return A Repository File Object.
   */
  @GET
  @Produces({"text/plain"})
  @Path("/resource")
  public Response getResource(@QueryParam("file") String file) {
    try {
      if (file == null || file.startsWith("/") || file.startsWith(".")) {
        throw new IllegalArgumentException("Path cannot be null or start with \"/\" or \".\" - Illegal Path: " + file);
      }

      String[] pathParts = file.split("/");
      String solution = pathParts.length > 1 ? pathParts[0] : "";
      String path = "";
      if (pathParts.length > 2) {
        for (int i = 1; i < pathParts.length - 1; i++) {
          path += "/" + pathParts[i];
        }
      }
      String action = pathParts[pathParts.length - 1];

      System.out.println("file: " + file + " solution:" + solution + " path:" + path + " action:" + action);

      String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
      ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, PentahoSessionHolder.getSession());

      if (repository == null) {
        log.error("Access to Repository has failed");
        throw new NullPointerException("Access to Repository has failed");
      }

      if (repository.resourceExists(fullPath)) {
        String doc = repository.getResourceAsString(fullPath, ISolutionRepository.ACTION_EXECUTE);
        if (doc == null) {
          log.error("Error retrieving document from solution repository");
          throw new NullPointerException("Error retrieving saiku document from solution repository");
        }
        return Response.ok(doc.getBytes("UTF-8"), MediaType.TEXT_PLAIN).header(
            "content-length", doc.getBytes("UTF-8").length).build();
      }

    } catch (Exception e) {
      log.error("Cannot load file (" + file + ")", e);
    }
    return Response.serverError().build();
  }

  /**
   * Save a resource.
   *
   * @param file    - The name of the repository file to load.
   * @param path    - The path of the given file to load.
   * @param content - The content to save.
   * @return Status
   */
  @POST
  @Path("/resource")
  public Response saveResource(
      @FormParam("file") String file,
      @FormParam("content") String content) {
    try {
      if (file == null || file.startsWith("/") || file.startsWith(".")) {
        throw new IllegalArgumentException("Path cannot be null or start with \"/\" or \".\" - Illegal Path: " + file);
      }

      String[] pathParts = file.split("/");
      String solution = pathParts.length > 1 ? pathParts[0] : "";
      String path = "";
      if (pathParts.length > 2) {
        for (int i = 1; i < pathParts.length - 1; i++) {
          path += "/" + pathParts[i];
        }
      }
      String action = pathParts[pathParts.length - 1];

      System.out.println("file: " + file + " solution:" + solution + " path:" + path + " action:" + action);

      String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
      IPentahoSession userSession = PentahoSessionHolder.getSession();
      ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);

      if (repository == null) {
        log.error("Access to Repository has failed");
        throw new NullPointerException("Access to Repository has failed");
      }
      String base = PentahoSystem.getApplicationContext().getSolutionRootPath();
      String parentPath = ActionInfo.buildSolutionPath(solution, path, "");
      ISolutionFile parentFile = repository.getSolutionFile(parentPath, ISolutionRepository.ACTION_CREATE);
      String filePath = parentPath + ISolutionRepository.SEPARATOR + action;
      ISolutionFile fileToSave = repository.getSolutionFile(fullPath, ISolutionRepository.ACTION_UPDATE);


      if (fileToSave != null || (!repository.resourceExists(filePath) && parentFile != null)) {
        repository.publish(base, '/' + parentPath, action, content.getBytes(), true);
        log.debug(PluginConfig.PLUGIN_NAME + " : Published " + solution + " / " + path + " / " + action);
      } else {
        throw new Exception("Error ocurred while saving query to solution repository");
      }
      return Response.ok().build();
    } catch (Exception e) {
      log.error("Cannot save file (" + file + ")", e);
    }
    return Response.serverError().build();
  }

  /**
   * Delete a resource.
   *
   * @param file - The name of the repository file to load.
   * @param path - The path of the given file to load.
   * @return Status
   */
  @DELETE
  @Path("/resource")
  public Response deleteResource(
      @QueryParam("file") String file) {
    return Response.serverError().build();
  }


  @GET
  @Path("/zip")
  public Response getResourcesAsZip(
      @QueryParam("directory") String directory,
      @QueryParam("files") String files) {
    try {
      if (StringUtils.isBlank(directory))
        return Response.ok().build();

      IPentahoSession userSession = PentahoSessionHolder.getSession();
      ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);
      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      ZipOutputStream zos = new ZipOutputStream(bos);

      String[] fileArray = null;
      if (StringUtils.isBlank(files)) {
        ISolutionFile dir = repository.getSolutionFile(directory);
        for (ISolutionFile fo : dir.listFiles()) {
          if (!fo.isDirectory()) {
            String entry = fo.getFileName();
            if (".saiku".equals(fo.getExtension())) {
              byte[] doc = fo.getData();
              ZipEntry ze = new ZipEntry(entry);
              zos.putNextEntry(ze);
              zos.write(doc);
            }
          }
        }
      } else {
        fileArray = files.split(",");
        for (String f : fileArray) {
          String resource = directory + "/" + f;
          Response r = getResource(resource);
          if (Status.OK.equals(Status.fromStatusCode(r.getStatus()))) {
            byte[] doc = (byte[]) r.getEntity();
            ZipEntry ze = new ZipEntry(f);
            zos.putNextEntry(ze);
            zos.write(doc);
          }
        }
      }
      zos.closeEntry();
      zos.close();
      byte[] zipDoc = bos.toByteArray();

      return Response.ok(zipDoc, MediaType.APPLICATION_OCTET_STREAM).header(
          "content-disposition",
          "attachment; filename = " + directory + ".zip").header(
          "content-length", zipDoc.length).build();


    } catch (Exception e) {
      log.error("Cannot zip resources " + files, e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }

  }

  @POST
  @Path("/zipupload")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public Response uploadArchiveZip(
      @QueryParam("test") String test,
      @FormDataParam("file") InputStream uploadedInputStream,
      @FormDataParam("file") FormDataContentDisposition fileDetail,
      @FormDataParam("directory") String directory) {
    String zipFile = fileDetail.getFileName();
    String output = "";
    try {
      if (StringUtils.isBlank(zipFile))
        throw new Exception("You must specify a zip file to upload");

      output = "Uploding file: " + zipFile + " ...\r\n";
      ZipInputStream zis = new ZipInputStream(uploadedInputStream);
      ZipEntry ze = zis.getNextEntry();
      byte[] doc = null;
      boolean isFile = false;
      if (ze == null) {
        doc = IOUtils.toByteArray(uploadedInputStream);
        isFile = true;
      }
      while (ze != null || doc != null) {
        String fileName = null;
        if (!isFile) {
          fileName = ze.getName();
          doc = IOUtils.toByteArray(zis);
        } else {
          fileName = zipFile;
        }

        output += "Saving " + fileName + "... ";
        String fullPath = (StringUtils.isNotBlank(directory)) ? directory + "/" + fileName : fileName;

        String content = new String(doc);
        Response r = saveResource(fullPath, content);
        doc = null;

        if (Status.OK.getStatusCode() != r.getStatus()) {
          output += " ERROR: " + r.getEntity().toString() + "\r\n";
        } else {
          output += " OK\r\n";
        }
        if (!isFile)
          ze = zis.getNextEntry();
      }

      if (!isFile) {
        zis.closeEntry();
        zis.close();
      }
      uploadedInputStream.close();

      output += " SUCCESSFUL!\r\n";
      return Response.ok(output).build();

    } catch (Exception e) {
      log.error("Cannot unzip resources " + zipFile, e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(output + "\r\n" + error).build();
    }
  }

  private List<IRepositoryObject> processTree(final Node tree, final String parentPath, String fileType) {
    final String xPathDir = "./file"; //$NON-NLS-1$
    List<IRepositoryObject> repoObjects = new ArrayList<IRepositoryObject>();
    List<AclMethod> defaultAcls = new ArrayList<AclMethod>();
    defaultAcls.add(AclMethod.READ);
    List<IPentahoAclEntry> adminAcl = new ArrayList<IPentahoAclEntry>();
    try {
      List nodes = tree.selectNodes(xPathDir);
      for (final Object node1 : nodes) {
        final Node node = (Node) node1;
        String name = node.valueOf("@name");
        final String localizedName = node.valueOf("@localized-name");
        final boolean visible = node.valueOf("@visible").equals("true");
        final boolean isDirectory = node.valueOf("@isDirectory").equals("true");
        final String path = StringUtils.isNotBlank(parentPath) ? parentPath + "/" + name : name;
        if (visible && isDirectory) {
          List<IRepositoryObject> children = new ArrayList<IRepositoryObject>();
//		  List<Node> fileNodes;
//		  if (StringUtils.isBlank(fileType)) {
//			fileNodes = node.selectNodes("./file[@isDirectory='false']");
//		  }
//		  else {
//			fileNodes = node.selectNodes("./file[@isDirectory='false'][ends-with(string(@name),'." + fileType + "') or ends-with(string(@name),'." + fileType + "')]");
//		  }
//		  for (final Node fileNode : fileNodes)
//		  {
//			boolean vis = fileNode.valueOf("@visible").equals("true");
//			String t = fileNode.valueOf("@localized-name");
//			String n = fileNode.valueOf("@name");
//			if (vis) {
//			  List<AclMethod> acls = getAcl(path, false);
//			  children.add(new RepositoryFileObject(t, "#" + path + "/" + n, fileType, path + "/" + n, acls));
//			}
//		  }
          children.addAll(processTree(node, path, fileType));
          List<AclMethod> acls = getAcl(path, true);
          repoObjects.add(new RepositoryFolderObject(localizedName, "#" + path, path, acls, children));
        } else if (visible && !isDirectory) {
          if (StringUtils.isBlank(fileType) || name.endsWith(fileType)) {
            List<AclMethod> acls = getAcl(path, false);
            repoObjects.add(new RepositoryFileObject(localizedName, "#" + path, fileType, path, acls));
          }
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return repoObjects;
  }


  private List<AclMethod> getAcl(String file, boolean folder) {
    boolean isAdministrator = SecurityHelper.isPentahoAdministrator(PentahoSessionHolder.getSession());
    ISolutionFile solutionFile = repository.getSolutionFile(file, ISolutionRepository.ACTION_EXECUTE);
    List<AclMethod> acls = new ArrayList<AclMethod>();
    acls.add(AclMethod.READ);

    if (isAdministrator
        || repository.hasAccess(solutionFile, IPentahoAclEntry.PERM_UPDATE)
        || (folder && repository.hasAccess(solutionFile, IPentahoAclEntry.PERM_CREATE))) {
      acls.add(AclMethod.WRITE);
    }
    if (isAdministrator || repository.hasAccess(solutionFile, IPentahoAclEntry.PERM_ADMINISTRATION)) {
      acls.add(AclMethod.GRANT);
    }
    return acls;

  }


}

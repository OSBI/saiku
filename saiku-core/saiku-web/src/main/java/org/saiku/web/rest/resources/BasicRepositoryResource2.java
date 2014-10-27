/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.web.rest.resources;


import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.ISessionService;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.util.exception.SaikuServiceException;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.vfs.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;


/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 */
@Component
@Path("/saiku/api/repository")
public class BasicRepositoryResource2 implements ISaikuRepository {

  private static final Logger LOG = LoggerFactory.getLogger(BasicRepositoryResource2.class);

  private FileObject repo;
  private ISessionService sessionService;

  //private Acl acl;
  private DatasourceService datasourceService;

  public void setDatasourceService(DatasourceService ds) {
    datasourceService = ds;
  }

  public void setPath(String path) throws Exception {
    FileSystemManager fileSystemManager;
    try {
      if (!path.endsWith("" + File.separatorChar)) {
        path += File.separatorChar;
      }
      fileSystemManager = VFS.getManager();
      FileObject fileObject;
      fileObject = fileSystemManager.resolveFile(path);
      if (fileObject == null) {
        throw new IOException("File cannot be resolved: " + path);
      }
      if (!fileObject.exists()) {
        throw new IOException("File does not exist: " + path);
      }
      repo = fileObject;
    } catch (Exception e) {
      LOG.error("Error setting path for repository: " + path, e);
    }
  }

/*public void setAcl(Acl acl) {
this.acl = acl;
}*/

  /**
   * Sets the sessionService
   *
   * @param sessionService
   */
  public void setSessionService(ISessionService sessionService) {
    this.sessionService = sessionService;
  }

  /* (non-Javadoc)
   * @see org.saiku.web.rest.resources.ISaikuRepository#getRepository(java.lang.String, java.lang.String)
   */
  @GET
  @Produces({ "application/json" })
  public List<IRepositoryObject> getRepository(
      @QueryParam("path") String path,
      @QueryParam("type") String type) {
    String username = sessionService.getAllSessionObjects().get("username").toString();
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
    return datasourceService.getFiles(type, username, roles);

  }


  @GET
  @Produces({ "application/json" })
  @Path("/resource/acl")
  public AclEntry getResourceAcl(@QueryParam("file") String file) {
    try {
      String username = sessionService.getAllSessionObjects().get("username").toString();
      List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
      return datasourceService.getResourceACL(file, username, roles);

    } catch (Exception e) {
      LOG.error("Error retrieving ACL for file: " + file, e);
    }
    throw new SaikuServiceException("You dont have permission to retrieve ACL for file: " + file);


  }


  @POST
  @Produces({ "application/json" })
  @Path("/resource/acl")
  public Response setResourceAcl(@FormParam("file") String file, @FormParam("acl") String aclEntry) {
    try {
      String username = sessionService.getAllSessionObjects().get("username").toString();
      List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
      datasourceService.setResourceACL(file, aclEntry, username, roles);
      return Response.ok().build();

      //LOG.debug("Repo file does not exist or cannot grant access. repo file:" + repoFile + " - file: " + file);
    } catch (Exception e) {
      LOG.error("An error occured while setting permissions to file: " + file, e);
    }
    return Response.serverError().build();

  }


  /* (non-Javadoc)
   * @see org.saiku.web.rest.resources.ISaikuRepository#getResource(java.lang.String)
   */
  @GET
  @Produces({ "text/plain" })
  @Path("/resource")
  public Response getResource(@QueryParam("file") String file) {
    String username = sessionService.getAllSessionObjects().get("username").toString();
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");

    byte[] data = new byte[0];
    try {
      data = datasourceService.getFileData(file, username, roles).getBytes("UTF-8");
    } catch (UnsupportedEncodingException e) {
      LOG.error("Error reading file encoding", e);
    }
    return Response.ok(data, MediaType.TEXT_PLAIN).header(
        "content-length", data.length).build();
/*
if ( !acl.canRead(file, username, roles) ) {
return Response.serverError().status(Status.FORBIDDEN).build();
}
*/
  }

  /* (non-Javadoc)
   * @see org.saiku.web.rest.resources.ISaikuRepository#saveResource(java.lang.String, java.lang.String)
   */
  @POST
  @Path("/resource")
  public Response saveResource(
      @FormParam("file") String file,
      @FormParam("content") String content) {
    String username = sessionService.getAllSessionObjects().get("username").toString();
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
    String resp = datasourceService.saveFile(content, file, username, roles);
    if (resp.equals("Save Okay")) {
      return Response.ok().build();
    } else {
      return Response.serverError().entity("Cannot save resource to ( file: " + file + ")").type("text/plain").build();
    }
/*
return Response.serverError().status(Status.FORBIDDEN)
.entity("You don't have permissions to save here!")
.type("text/plain").build();
*/
  }

  /* (non-Javadoc)
   * @see org.saiku.web.rest.resources.ISaikuRepository#deleteResource(java.lang.String)
   */
  @DELETE
  @Path("/resource")
  public Response deleteResource(
      @QueryParam("file") String file) {
    String username = sessionService.getAllSessionObjects().get("username").toString();
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
    String resp = datasourceService.removeFile(file, username, roles);
    if (resp.equals("Remove Okay")) {
      return Response.ok().build();
    } else {
      return Response.serverError().entity("Cannot save resource to ( file: " + file + ")").type("text/plain").build();
    }

  }

  /* (non-Javadoc)
   * @see org.saiku.web.rest.resources.ISaikuRepository#saveResource(java.lang.String, java.lang.String)
   */
  @POST
  @Path("/resource/move")
  public Response moveResource(@FormParam("source") String source, @FormParam("target") String target) {
    String username = sessionService.getAllSessionObjects().get("username").toString();
    List<String> roles = (List<String>) sessionService.getAllSessionObjects().get("roles");
    String resp = datasourceService.moveFile(source, target, username, roles);
    if (resp.equals("Move Okay")) {
      return Response.ok().entity("{}").build();
    } else {
      return Response.serverError().entity("Cannot move resource to ( file: " + target + ")").type("text/plain")
                     .build();
    }



/*try {
if (source == null || source.startsWith("/") || source.startsWith(".")) {
throw new IllegalArgumentException("Path cannot be null or start with \"/\" or \".\" - Illegal Path: " + source);
}
if (target == null || target.startsWith("/") || target.startsWith(".")) {
throw new IllegalArgumentException("Path cannot be null or start with \"/\" or \".\" - Illegal Path: " + target);
}

String username = sessionService.getAllSessionObjects().get("username").toString();
List<String> roles = (List<String> ) sessionService.getAllSessionObjects().get("roles");
FileObject targetFile = repo.resolveFile(target);

if ( !acl.canWrite(target,username, roles) ) {
return Response.serverError().status(Status.FORBIDDEN)
.entity("You don't have permissions to save here!")
.type("text/plain").build();
}

if (targetFile == null) throw new Exception("Repo File not found");

if (targetFile.exists()) {
throw new Exception("Target file exists already. Cannot write: " + target);
}

FileObject sourceFile = repo.resolveFile(source);
if ( !acl.canRead(source, username, roles) ) {
return Response.serverError().status(Status.FORBIDDEN).entity
("You don't have permissions to read the source file: " + source).build();
}

if (!sourceFile.exists()) {
throw new Exception("Source file does not exist: " + source);
}
if (!sourceFile.canRenameTo(targetFile)) {
throw new Exception("Cannot rename " + source + " to " + target);
}
sourceFile.moveTo(targetFile);
return Response.ok().build();
} catch(Exception e){
LOG.error("Cannot move resource from " + source + " to " + target ,e);
return Response.serverError().entity("Cannot move resource from
" + source + " to " + target + " ( " + e.getMessage() + ")").type("text/plain").build();
}
*/
  }

  @GET
  @Path("/zip")
  public Response getResourcesAsZip(
      @QueryParam("directory") String directory,
      @QueryParam("files") String files) {
    try {
      if (StringUtils.isBlank(directory)) {
        return Response.ok().build();
      }

      ByteArrayOutputStream bos = new ByteArrayOutputStream();
      ZipOutputStream zos = new ZipOutputStream(bos);

      String[] fileArray = null;
      if (StringUtils.isBlank(files)) {
        FileObject dir = repo.resolveFile(directory);
        for (FileObject fo : dir.getChildren()) {
          if (fo.getType().equals(FileType.FILE)) {
            String entry = fo.getName().getBaseName();
            if ("saiku".equals(fo.getName().getExtension())) {
              byte[] doc = FileUtil.getContent(fo);
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
      LOG.error("Cannot zip resources " + files, e);
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
      if (StringUtils.isBlank(zipFile)) {
        throw new Exception("You must specify a zip file to upload");
      }

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
        if (!isFile) {
          ze = zis.getNextEntry();
        }
      }

      if (!isFile) {
        zis.closeEntry();
        zis.close();
      }
      uploadedInputStream.close();

      output += " SUCCESSFUL!\r\n";
      return Response.ok(output).build();

    } catch (Exception e) {
      LOG.error("Cannot unzip resources " + zipFile, e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(output + "\r\n" + error).build();
    }


  }

}

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

import org.saiku.olap.dto.SimpleCubeElement;
import org.saiku.olap.dto.filter.SaikuFilter;
import org.saiku.service.ISessionService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.vfs.*;
import org.codehaus.jackson.annotate.JsonAutoDetect.Visibility;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 */
@Component
@Path("/saiku/{username}/filters")
@XmlAccessorType(XmlAccessType.NONE)
public class FilterRepositoryResource {

  private static final Logger LOG = LoggerFactory.getLogger(FilterRepositoryResource.class);

  private static final String SETTINGS_FILE = "settings.properties";
  private static final String FILTER_FILENAME = "saiku.filters";

  private OlapQueryService olapQueryService;
  private ISessionService sessionService;

  private FileObject repo;


  private Properties settings = new Properties();

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
      //FileObject file = repo.resolveFile(FILTER_FILENAME);
      //filterFile = file;

      //if (repo != null) {
      //FileObject settings = repo.getChild(SETTINGS_FILE);
      //if (settings != null && settings.exists() && settings.isReadable()) {
      //Properties setProps = new Properties();
      //setProps.load(settings.getContent().getInputStream());
      //this.settings = setProps;
      //}
      //
      //}
    } catch (Exception e) {
      LOG.error("Error setting path: " + path, e);
    }

  }


  //@Autowired
  public void setOlapQueryService(OlapQueryService olapqs) {
    olapQueryService = olapqs;
  }

  //@Autowired
  public void setSessionService(ISessionService ss) {
    sessionService = ss;
  }


  private Map<String, SaikuFilter> getFiltersInternal() throws Exception {
    return getFiltersInternal(null);
  }

  private Map<String, SaikuFilter> getFiltersInternal(String query) throws Exception {
    Map<String, SaikuFilter> allFilters = new HashMap<String, SaikuFilter>();
    Map<String, SaikuFilter> filters = deserialize(getUserFile());
    allFilters.putAll(filters);
    if (StringUtils.isNotBlank(query)) {
      allFilters = olapQueryService.getValidFilters(query, allFilters);
    }

    return MapUtils.orderedMap(allFilters);
  }

  private Map<String, SaikuFilter> getAllFiltersForExportInternal() throws Exception {
    Map<String, SaikuFilter> allFilters = new HashMap<String, SaikuFilter>();
    for (FileObject f : repo.getChildren()) {
      if (f.getType().equals(FileType.FILE) && f.getName().getBaseName().endsWith(FILTER_FILENAME)) {
        Map<String, SaikuFilter> filters = deserialize(f);
        allFilters.putAll(filters);
      }
    }
    return MapUtils.orderedMap(allFilters);
  }


  @GET
  @Produces({ "text/csv" })
  @Path("/csv")
  public Response getAllFiltersCsv(
      @QueryParam("delimiter") @DefaultValue(",") String delimiter,
      @QueryParam("memberdelimiter") @DefaultValue("|") String memberdelimiter) {
    try {
      Map<String, SaikuFilter> allFilters = getAllFiltersForExportInternal();
      if (allFilters != null) {
        byte[] doc = getCsv(allFilters, delimiter, memberdelimiter);
        return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
            "content-disposition",
            "attachment; filename = filters.csv").header(
            "content-length", doc.length).build();

      } else {
        return Response.ok().build();
      }
    } catch (Exception e) {
      LOG.error("Cannot get filter csv", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }


  }


  @GET
  @Produces({ "application/json" })
  @Path("/names/")
  public Response getSavedFilterNames(@QueryParam("queryname") String queryName) {
    try {
      Map<String, SaikuFilter> allFilters = getFiltersInternal(queryName);
      List<String> filternames = new ArrayList<String>(allFilters.keySet());
      Collections.sort(filternames);
      return Response.ok(filternames).build();

    } catch (Exception e) {
      LOG.error("Cannot filter names", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }
  }


  @GET
  @Produces({ "application/json" })
  public Response getSavedFilters(
      @QueryParam("query") String queryName,
      @QueryParam("filtername") String filterName) {
    try {
      Map<String, SaikuFilter> allFilters = new HashMap<String, SaikuFilter>();
      if (StringUtils.isNotBlank(queryName)) {
        allFilters = getFiltersInternal(queryName);
      } else if (StringUtils.isNotBlank(filterName)) {
        allFilters = getFiltersInternal();
        Map<String, SaikuFilter> singleFilter = new HashMap<String, SaikuFilter>();
        if (allFilters.containsKey(filterName)) {
          singleFilter.put(filterName, allFilters.get(filterName));
          allFilters = singleFilter;
        }
      } else {
        allFilters = getFiltersInternal();
      }
      return Response.ok(allFilters).build();
    } catch (Exception e) {
      LOG.error("Cannot get filter details", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }
  }

  @POST
  @Produces({ "application/json" })
  @Path("/{filtername}")
  public Response saveFilter(
      @FormParam("filter") String filterJSON) {
    try {

      ObjectMapper mapper = new ObjectMapper();
      mapper.setVisibilityChecker(mapper.getVisibilityChecker().withFieldVisibility(Visibility.ANY));
      SaikuFilter filter = mapper.readValue(filterJSON, SaikuFilter.class);
      String username = sessionService.getAllSessionObjects().get("username").toString();
      filter.setOwner(username);
      Map<String, SaikuFilter> filters = getFiltersInternal();
      filters.put(filter.getName(), filter);
      serialize(getUserFile(), filters);
      return Response.ok(filter).build();
    } catch (Exception e) {
      LOG.error("Cannot save filter (" + filterJSON + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }
  }


  @DELETE
  @Produces({ "application/json" })
  @Path("/{filtername}")
  public Response deleteFilter(@PathParam("filtername") String filterName) {
    try {
      if (repo != null) {
        Map<String, SaikuFilter> filters = getFiltersInternal();
        if (filters.containsKey(filterName)) {
          filters.remove(filterName);
        }
        serialize(getUserFile(), filters);
        return Response.ok(filters).status(Status.OK).build();

      }
      throw new Exception("Cannot delete filter :" + filterName);
    } catch (Exception e) {
      LOG.error("Cannot delete filter (" + filterName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return Response.serverError().entity(error).build();
    }
  }

  private byte[] getCsv(Map<String, SaikuFilter> filters, String delimiter, String memberdelimiter) {
    try {

      StringBuffer sb = new StringBuffer();
      sb.append("User" + delimiter + "FilterName" + delimiter + "Dimension" + delimiter + "Hierarchy" + delimiter
                + "Members");
      sb.append("\r\n");
      for (SaikuFilter sf : filters.values()) {
        String row = sf.getOwner() + delimiter + sf.getName() + delimiter + sf.getDimension().getName() + delimiter + sf
            .getHierarchy().getName() + delimiter;
        String members = "";
        boolean first = true;
        for (SimpleCubeElement e : sf.getMembers()) {
          if (!first) {
            members += memberdelimiter;
          } else {
            first = false;
          }
          members += e.getName();
        }
        sb.append(row + members + "\r\n");
      }
      return sb.toString().getBytes("UTF-8");
    } catch (Throwable e) {
      throw new SaikuServiceException("Error creating csv export for filters"); //$NON-NLS-1$
    }
  }

  private Map<String, SaikuFilter> deserialize(FileObject filterFile) throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    Map<String, SaikuFilter> filters = new HashMap<String, SaikuFilter>();
    if (filterFile != null && filterFile.exists() && filterFile.getContent().getSize() > 0) {
      InputStreamReader reader = new InputStreamReader(filterFile.getContent().getInputStream());
      BufferedReader br = new BufferedReader(reader);
      mapper.setVisibilityChecker(mapper.getVisibilityChecker().withFieldVisibility(Visibility.ANY));
      try {
        filters = mapper.readValue(br, TypeFactory.mapType(HashMap.class, String.class, SaikuFilter.class));
      } catch (EOFException e) {
        LOG.error("Can't read mapper", e);
      }
    }
    return filters;
  }

  private FileObject getUserFile() throws FileSystemException {
    if (sessionService.getAllSessionObjects().containsKey("username")) {
      String username = sessionService.getAllSessionObjects().get("username").toString();
      username = username.replaceAll("/", "-");
      FileObject fo = repo.resolveFile(username + "-" + FILTER_FILENAME);
      return fo;
    }
    return null;

  }


  private void serialize(FileObject filterFile, Map<String, SaikuFilter> map) throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    if (filterFile.exists()) {
      filterFile.delete();
    }
    mapper.writeValue(filterFile.getContent().getOutputStream(), map);
  }


}

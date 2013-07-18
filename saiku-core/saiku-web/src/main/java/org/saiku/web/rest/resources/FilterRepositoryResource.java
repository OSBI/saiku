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
package org.saiku.web.rest.resources;

import java.io.BufferedReader;
import java.io.EOFException;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.codehaus.jackson.annotate.JsonAutoDetect.Visibility;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.saiku.olap.dto.SaikuQuery;
import org.saiku.olap.dto.filter.SaikuFilter;
import org.saiku.service.olap.OlapQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Paul Stoellberger
 *
 */
@Component
@Path("/saiku/{username}/filters")
@XmlAccessorType(XmlAccessType.NONE)
public class FilterRepositoryResource {

	private static final Logger log = LoggerFactory.getLogger(FilterRepositoryResource.class);

	private static final String SETTINGS_FILE = "settings.properties";
	private static final String FILTER_FILENAME = "saiku.filters";

	private OlapQueryService olapQueryService;

	private FileObject repo;
	private FileObject filterFo;

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
			if(!fileObject.exists()) {
				throw new IOException("File does not exist: " + path);
			}
			repo = fileObject;
			FileObject file = repo.resolveFile(FILTER_FILENAME);
			filterFo = file;

			//			if (repo != null) {
			//				FileObject settings = repo.getChild(SETTINGS_FILE);
			//				if (settings != null && settings.exists() && settings.isReadable()) {
			//					Properties setProps = new Properties();
			//					setProps.load(settings.getContent().getInputStream());
			//					this.settings = setProps;
			//				}
			//				
			//			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}


	@Autowired
	public void setOlapQueryService(OlapQueryService olapqs) {
		olapQueryService = olapqs;
	}

	private Map<String, SaikuFilter> getFiltersInternal() throws Exception {
		return getFiltersInternal(null);
	}
	
	private Map<String, SaikuFilter> getFiltersInternal(String query) throws Exception {
		Map<String, SaikuFilter> allFilters = new HashMap<String, SaikuFilter>();
		if (filterFo != null) {
			Map<String, SaikuFilter> filters = deserialize(filterFo);
			allFilters.putAll(filters);
			if (StringUtils.isNotBlank(query)) {
				allFilters = olapQueryService.getValidFilters(query, allFilters);
			}

		}
		else {
			throw new Exception("filter file URL is null");
		}
		return MapUtils.orderedMap(allFilters);
	}


	@GET
	@Produces({"application/json" })
	public Response getSavedFilterNames(@QueryParam("queryname") String queryName) 
	{
		try {
			Map<String, SaikuFilter> allFilters = getFiltersInternal(queryName);
			List<String> filternames = new ArrayList<String>(allFilters.keySet());
			Collections.sort(filternames);
			return Response.ok(filternames).build();

		} catch(Exception e){
			log.error("Cannot filter names",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			return Response.serverError().entity(error).build();
		}
	}
	


	@GET
	@Produces({"application/json" })
	@Path("/details/")
	public Response getSavedFilters(@QueryParam("queryname") String queryName) 
	{
		try {
			Map<String, SaikuFilter> allFilters = getFiltersInternal(queryName);
			return Response.ok(allFilters).build();
		} catch(Exception e){
			log.error("Cannot get filter details",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			return Response.serverError().entity(error).build();
		}
	}
	


	@DELETE
	@Produces({"application/json" })
	@Path("/name/{filtername}")
	public Response deleteFilter(@PathParam("filtername") String filterName)
	{
		try{
			if (repo != null) {
				Map<String, SaikuFilter> filters = getFiltersInternal();
				if (filters.containsKey(filterName)) {
					filters.remove(filterName);
				}
				serialize(filterFo, filters);
				return Response.ok(filters).status(Status.GONE).build();

			}
			throw new Exception("Cannot delete filter :" + filterName );
		}
		catch(Exception e){
			log.error("Cannot delete filter (" + filterName + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			return Response.serverError().entity(error).build();
		}
	}

	@GET
	@Produces({"application/json" })
	@Path("/name/{filter}")
	public Response saveFilter(
			@PathParam("filter") String filtername,
			@QueryParam("queryname") String queryName,
			@QueryParam("dimension") String dimension,
			@QueryParam("hierarchy") String hierarchy,
			@QueryParam("level") String level)
	{
		try {
			SaikuFilter t = olapQueryService.getFilter(queryName, filtername, dimension, hierarchy, level);
			Map<String, SaikuFilter> filters = getFiltersInternal();
			filters.put(filtername, t);
			serialize(filterFo, filters);
			return Response.ok(t).build();
		}
		catch (Exception e) {
			log.error("Cannot set filter (" + filtername + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			return Response.serverError().entity(error).build();
		}
	}

	private Map<String, SaikuFilter> deserialize(FileObject filterFile) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		Map<String, SaikuFilter> filters = new HashMap<String, SaikuFilter>();
		if ( filterFile != null && filterFile.exists() && filterFile.getContent().getSize() > 0) {
			InputStreamReader reader = new InputStreamReader(filterFile.getContent().getInputStream());
			BufferedReader br = new BufferedReader(reader);
			mapper.setVisibilityChecker(mapper.getVisibilityChecker().withFieldVisibility(Visibility.ANY));
			try {
				filters = mapper.readValue(br, TypeFactory.mapType(HashMap.class, String.class, SaikuFilter.class));
			} catch (EOFException e) {}
		}
		return filters;
	}

	private void serialize(FileObject filterFile, Map<String, SaikuFilter> map) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		if (filterFile.exists()) {
			filterFile.delete();
		}
		mapper.writeValue(filterFile.getContent().getOutputStream(), map);
	}




}

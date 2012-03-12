/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.web.rest.resources;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.codehaus.jackson.annotate.JsonAutoDetect.Visibility;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.saiku.olap.dto.SaikuTag;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.SavedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import edu.emory.mathcs.backport.java.util.Collections;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Paul Stoellberger
 *
 */
@Component
@Path("/saiku/{username}/repository")
@XmlAccessorType(XmlAccessType.NONE)
public class BasicRepositoryResource {

	private static final Logger log = LoggerFactory.getLogger(BasicRepositoryResource.class);

	private OlapQueryService olapQueryService;

	private FileObject repo;

	private OlapDiscoverService olapDiscoverService;

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
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	@Autowired
	public void setOlapQueryService(OlapQueryService olapqs) {
		olapQueryService = olapqs;
	}

	@Autowired
	public void setOlapDiscoverService(OlapDiscoverService olapds) {
		olapDiscoverService = olapds;
	}

	/**
	 * Get Saved Queries.
	 * @return A list of SavedQuery Objects.
	 */
	@GET
	@Path("/queries")
	@Produces({"application/json" })
	public List<SavedQuery> getSavedQueries() {
		List<SavedQuery> queries = new ArrayList<SavedQuery>();
		try {
			if (repo != null) {
				File[] files = new File(repo.getName().getPath()).listFiles();
				for (File file : files) {
					if (!file.isHidden()) {
						SimpleDateFormat sf = new SimpleDateFormat("dd - MMM - yyyy HH:mm:ss");
						String filename = file.getName();
						if (filename.endsWith(".saiku")) {
							filename = filename.substring(0,filename.length() - ".saiku".length());

								FileReader fi = new FileReader(file);
								BufferedReader br = new BufferedReader(fi);
								String chunk ="",xml ="";
								while ((chunk = br.readLine()) != null) {
									xml += chunk + "\n";
								}
							SavedQuery sq = new SavedQuery(filename, sf.format(new Date(file.lastModified())),xml);
							queries.add(sq);
						}
					}
				}

			}
			else {
				throw new Exception("repo URL is null");
			}
		} catch (Exception e) {
			log.error(this.getClass().getName(),e);
			e.printStackTrace();
		}
		Collections.sort(queries);
		return queries;
	}

	/**
	 * Delete Query.
	 * @param queryName - The name of the query.
	 * @return A GONE Status if the query was deleted, otherwise it will return a NOT FOUND Status code.
	 */
	@DELETE
	@Produces({"application/json" })
	@Path("/queries/{queryname}")
	public Status deleteQuery(@PathParam("queryname") String queryName){
		try{
			if (repo != null) {
				if (!queryName.endsWith(".saiku")) {
					queryName += ".saiku";
				}
				FileObject queryFile = repo.resolveFile(queryName);
				if (queryFile.delete()) {
					return(Status.GONE);
				}
			}
			throw new Exception("Cannot delete query file:" + queryName);
		}
		catch(Exception e){
			log.error("Cannot delete query (" + queryName + ")",e);
			return(Status.NOT_FOUND);
		}
	}

	/**
	 * 
	 * @param queryName - The name of the query.
	 * @param newName - The saved query name.
	 * @return An OK Status, if the save was good, otherwise a NOT FOUND Status when not saved properly.
	 */
	@POST
	@Produces({"application/json" })
	@Path("/queries/{queryname}")
	public Status saveQuery(
			@PathParam("queryname") String queryName,
			@FormParam("newname") String newName ){
		try{
			String xml = olapQueryService.getQueryXml(queryName);
			if (newName != null) {
				queryName = newName;
			}
			
			if (repo != null && xml != null) {
				if (!queryName.endsWith(".saiku")) {
					queryName += ".saiku";
				}
				String uri = repo.getName().getPath();
				if (!uri.endsWith("" + File.separatorChar)) {
					uri += File.separatorChar;
				}
				
				File queryFile = new File(uri+URLDecoder.decode(queryName, "UTF-8"));
				if (queryFile.exists()) {
					queryFile.delete();
				}
				else {
					queryFile.createNewFile();
				}
				FileWriter fw = new FileWriter(queryFile);
				fw.write(xml);
				fw.close();
				return(Status.OK);
			}
			else {
				throw new Exception("Cannot save query because repo or xml is null repo(" 
						+ (repo == null) + ") xml(" + (xml == null) + " )" );
			}
		}
		catch(Exception e){
			log.error("Cannot save query (" + queryName + ")",e);
			return(Status.NOT_FOUND);
		}
	}

	/**
	 * Load a query.
	 * @param queryName - The name of the query to load.
	 * @return A Saiku Query Object.
	 */
	@GET
	@Produces({"application/json" })
	@Path("/queries/{queryname}")
	public SavedQuery loadQuery(@PathParam("queryname") String queryName){
		try{
			String uri = repo.getName().getPath();
			if (uri != null && !uri.endsWith("" + File.separatorChar)) {
				uri += File.separatorChar;
			}

			String filename = queryName;
			if (uri != null) {
				if (!filename.endsWith(".saiku")) {
					filename += ".saiku";
				}
				String filepath = repo.getName().getPath();
				if (!filepath.endsWith("" + File.separatorChar)) {
					filepath += File.separatorChar;
				}
				
				File queryFile = new File(uri+filename);

				if (queryFile.exists()) {
					FileReader fi = new FileReader(queryFile);
					BufferedReader br = new BufferedReader(fi);
					String chunk ="",xml ="";
					while ((chunk = br.readLine()) != null) {
						xml += chunk + "\n";
					}
					SimpleDateFormat sf = new SimpleDateFormat("dd - MMM - yyyy HH:mm:ss");
					SavedQuery sq = new SavedQuery(filename, sf.format(new Date(queryFile.lastModified())),xml);
					return sq;
				}
				else {
					throw new Exception("File does not exist:" + uri);
				}
			}
			else {
				throw new Exception("Cannot save query because uriis null");
			}
		} catch(Exception e){
			log.error("Cannot load query (" + queryName + ")",e);
		}
		return null;
	}
	
	/**
	 * Get Saved Queries.
	 * @return A list of SavedQuery Objects.
	 */
	@GET
	@Path("/tags/{cubeIdentifier}")
	@Produces({"application/json" })
	public List<SaikuTag> getSavedTags(
			@PathParam("cubeIdentifier") String cubeIdentifier) 
	{
		List<SaikuTag> allTags = new ArrayList<SaikuTag>();
		try {
			if (repo != null) {
				File[] files = new File(repo.getName().getPath()).listFiles();
				for (File file : files) {
					if (!file.isHidden()) {
						
						String filename = file.getName();
						if (filename.endsWith(".tag")) {
							filename = filename.substring(0,filename.length() - ".tag".length());
							if (filename.equals(cubeIdentifier)) {
								FileReader fi = new FileReader(file);
								BufferedReader br = new BufferedReader(fi);
								ObjectMapper om = new ObjectMapper();
							    om.setVisibilityChecker(om.getVisibilityChecker().withFieldVisibility(Visibility.ANY));
							    
								List<SaikuTag> tags = om.readValue(file, TypeFactory.collectionType(ArrayList.class, SaikuTag.class));
								allTags.addAll(tags);
							}
						}
					}
				}

			}
			else {
				throw new Exception("repo URL is null");
			}
		} catch (Exception e) {
			log.error(this.getClass().getName(),e);
			e.printStackTrace();
		}
		Collections.sort(allTags);
		return allTags;
	}

	/**
	 * Delete Query.
	 * @param queryName - The name of the query.
	 * @return A GONE Status if the query was deleted, otherwise it will return a NOT FOUND Status code.
	 */
	@DELETE
	@Produces({"application/json" })
	@Path("/tags/{cubeIdentifier}/{tagName}")
	public Status deleteTag(
			@PathParam("cubeIdentifier") String cubeIdentifier,
			@PathParam("tagName") String tagName)
	{
		try{
			if (repo != null) {
				List<SaikuTag> tags = getSavedTags(cubeIdentifier);
				List<SaikuTag> remove = new ArrayList<SaikuTag>();
				for(SaikuTag tag : tags) {
					if(tag.getName().equals(tagName)) {
						remove.add(tag);
					}
				}
				tags.removeAll(remove);
				ObjectMapper om = new ObjectMapper();
			    om.setVisibilityChecker(om.getVisibilityChecker().withFieldVisibility(Visibility.ANY));

				String uri = repo.getName().getPath();
				if (!uri.endsWith("" + File.separatorChar)) {
					uri += File.separatorChar;
				}
				if (!cubeIdentifier.endsWith(".tag")) {
					cubeIdentifier += ".tag";
				}

				File tagFile = new File(uri+URLDecoder.decode(cubeIdentifier, "UTF-8"));
				if (tagFile.exists()) {
					tagFile.delete();
				}
				else {
					tagFile.createNewFile();
				}
				om.writeValue(tagFile, tags);
				return(Status.GONE);
				
			}
			throw new Exception("Cannot delete tag :" + tagName );
		}
		catch(Exception e){
			log.error("Cannot delete tag (" + tagName + ")",e);
			return(Status.NOT_FOUND);
		}
	}

	@POST
	@Produces({"application/json" })
	@Path("/tags/{cubeIdentifier}/{tagname}")
	public SaikuTag saveTag(
			@PathParam("tagname") String tagName,
			@PathParam("cubeIdentifier") String cubeIdentifier,
			@FormParam("queryname") String queryName,
			@FormParam("positions") String positions)
	{
		try {
			List<List<Integer>> cellPositions = new ArrayList<List<Integer>>();
			for (String position : positions.split(",")) {
				String[] ps = position.split(":");
				List<Integer> cellPosition = new ArrayList<Integer>();

				for (String p : ps) {
					Integer pInt = Integer.parseInt(p);
					cellPosition.add(pInt);
				}
				cellPositions.add(cellPosition);
			}
			SaikuTag t = olapQueryService.createTag(queryName, tagName, cellPositions);
			
			if (repo != null) {
				List<SaikuTag> tags = getSavedTags(cubeIdentifier);
				if (!cubeIdentifier.endsWith(".tag")) {
					cubeIdentifier += ".tag";
				}
				List<SaikuTag> remove = new ArrayList<SaikuTag>();
				for(SaikuTag tag : tags) {
					if(tag.getName().equals(tagName)) {
						remove.add(tag);
					}
				}
				tags.removeAll(remove);
				
				tags.add(t);
				ObjectMapper om = new ObjectMapper();
			    om.setVisibilityChecker(om.getVisibilityChecker().withFieldVisibility(Visibility.ANY));

				String uri = repo.getName().getPath();
				if (!uri.endsWith("" + File.separatorChar)) {
					uri += File.separatorChar;
				}
				File tagFile = new File(uri+URLDecoder.decode(cubeIdentifier, "UTF-8"));
				if (tagFile.exists()) {
					tagFile.delete();
				}
				else {
					tagFile.createNewFile();
				}
				om.writeValue(tagFile, tags);
				return t;
			}
		}
		catch (Exception e) {
			log.error("Cannot add tag " + tagName + " for query (" + queryName + ")",e);
		}
		return null;

	}
	
	@GET
	@Produces({"application/json" })
	@Path("/tags/{cubeIdentifier}/{tagName}")
	public SaikuTag getTag(
			@PathParam("cubeIdentifier") String cubeIdentifier,
			@PathParam("tagName") String tagName)
	{
		try{
			if (repo != null) {
				List<SaikuTag> tags = getSavedTags(cubeIdentifier);
				for(SaikuTag tag : tags) {
					if(tag.getName().equals(tagName)) {
						return tag;
					}
				}
			}
		}
		catch (Exception e) {
			log.error("Cannot get tag " + tagName + " for " + cubeIdentifier ,e);
		}
		return null;
	}

	
}

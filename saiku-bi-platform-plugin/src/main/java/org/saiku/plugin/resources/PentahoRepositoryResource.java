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

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.engine.ISolutionFile;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.saiku.plugin.util.PluginConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Paul Stoellberger
 *
 */
@Component
@Path("/saiku/{username}/pentahorepository")
@Scope("request")
@XmlAccessorType(XmlAccessType.NONE)
public class PentahoRepositoryResource {

	private static final Logger log = LoggerFactory.getLogger(PentahoRepositoryResource.class);

	/**
	 * 
	 * @param queryName - The name of the query.
	 * @param newName - The saved query name.
	 * @return An OK Status, if the save was good, otherwise a NOT FOUND Status when not saved properly.
	 */
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/{name}")
	public Status saveQuery(
			@PathParam("name") String queryName,
			@FormParam("xml") String xml,
			@FormParam("solution") String solution,
			@FormParam("path") String path,
			@FormParam("action") String action)
	{
		try {

			if (!action.endsWith(".saiku")) {
				action += ".saiku";
			}
			System.out.println("solution:"+solution+" path:"+path + " action:" + action);


			String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
			IPentahoSession userSession = PentahoSessionHolder.getSession();
			ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);

			if( repository == null ) {
				log.error("Access to Repository has failed");
				throw new NullPointerException("Access to Repository has failed");
			}

			String base = PentahoSystem.getApplicationContext().getSolutionRootPath();
			String parentPath = ActionInfo.buildSolutionPath(solution, path, "");
			ISolutionFile parentFile = repository.getSolutionFile(parentPath, ISolutionRepository.ACTION_CREATE);
			String filePath = parentPath + ISolutionRepository.SEPARATOR + action;
			ISolutionFile fileToSave = repository.getSolutionFile(fullPath, ISolutionRepository.ACTION_UPDATE);



			if (fileToSave != null || (!repository.resourceExists(filePath) && parentFile != null)) {
				repository.publish(base, '/' + parentPath, action, xml.getBytes() , true);
				log.debug(PluginConfig.PLUGIN_NAME + " : Published " + solution + " / " + path + " / " + action );
			} else {
				throw new Exception("Error ocurred while saving query to solution repository");
			}
			return(Status.OK);
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
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/{name}")
	public SavedQuery loadQuery(
			@PathParam("name") String name,
			@QueryParam("solution") String solution,
			@QueryParam("path") String path,
			@QueryParam("action") String action)		
	{
		try{
			if (!action.endsWith(".saiku")) {
				action += ".saiku";
			}
			
			System.out.println("load solution:"+solution+" path:"+path + " action:" + action);
			String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
			IPentahoSession userSession = PentahoSessionHolder.getSession();
			ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);


			if (repository.resourceExists(fullPath)) {
				String doc = repository.getResourceAsString(fullPath, ISolutionRepository.ACTION_EXECUTE);
				if (doc == null) {
					log.error("Error retrieving saiku document from solution repository"); 
					throw new NullPointerException("Error retrieving saiku document from solution repository"); 
				}

				SavedQuery sq = new SavedQuery(name, null, doc);
				return sq;
			}

		} catch(Exception e){
			log.error("Cannot load query (" + name + ")",e);
		}
		return null;
	}
}

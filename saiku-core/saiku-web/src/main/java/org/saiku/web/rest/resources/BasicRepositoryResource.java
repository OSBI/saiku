/*
 * Copyright (C) 2011 Paul Stoellberger
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
import java.net.URISyntaxException;
import java.net.URL;
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

import org.saiku.olap.dto.SaikuQuery;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.SavedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Tom Barber
 *
 */
@Component
@Path("/saiku/{username}/repository")
@Scope("request")
@XmlAccessorType(XmlAccessType.NONE)
public class BasicRepositoryResource {

    private static final Logger log = LoggerFactory.getLogger(BasicRepositoryResource.class);

    private OlapQueryService olapQueryService;
    
    private QueryResource queryResource;
    
    private String path;
    
    private URL repoURL;

	private OlapDiscoverService olapDiscoverService;

    public void setPath(String path) throws URISyntaxException {
		repoURL = this.getClass().getClassLoader().getResource(path);
		this.path = (new File(repoURL.toURI())).getAbsolutePath();
	}
    
	@Autowired
	public void setOlapQueryService(OlapQueryService olapqs) {
		olapQueryService = olapqs;
	}
	
	@Autowired
	public void setOlapDiscoverService(OlapDiscoverService olapds) {
		olapDiscoverService = olapds;
	}

	
	@Autowired
	public void setQueryResource(QueryResource qr) {
		queryResource = qr;
	}

    @GET
    @Produces({"application/json" })
     public List<SavedQuery> getSavedQueries() {
    	List<SavedQuery> queries = new ArrayList<SavedQuery>();
    	try {
    		      if (repoURL != null) {
    		    	  if ( repoURL.getProtocol().equals("file")) {
    		    		  File[] files = new File(repoURL.toURI()).listFiles();
    		    		  for (File file : files) {
    		    			  if (!file.isHidden()) {
    		    				  SimpleDateFormat sf = new SimpleDateFormat("dd - MMM - yyyy HH:mm:ss");
    		    				  String filename = file.getName();
    		    				  if (filename.endsWith(".squery")) {
    		    					  filename = filename.substring(0,filename.length() - ".squery".length());
    		    				  }
    		    				  SavedQuery sq = new SavedQuery(filename, sf.format(new Date(file.lastModified())));
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
		}
		return queries;
    }
    
	@DELETE
    @Produces({"application/json" })
	@Path("/{queryname}")
	public Status deleteQuery(@PathParam("queryname") String queryName){
		try{
			String uri = repoURL.toURI().toString();
			if (uri != null) {
				if (!queryName.endsWith(".squery")) {
					queryName += ".squery";
				}

				URL url = new URL(uri + queryName);
				File queryFile = null;
				try {
					queryFile = new File(url.toURI());
				} catch(URISyntaxException e) {
					queryFile = new File(url.getPath());
				}

				if (queryFile.delete()) {
					return(Status.GONE);
				}
			}
			throw new Exception("Cannot delete query file uri:" + uri);
		}
		catch(Exception e){
			log.error("Cannot delete query (" + queryName + ")",e);
			return(Status.NOT_FOUND);
		}
	}
	
	@POST
    @Produces({"application/json" })
	@Path("/{queryname}")
	public Status saveQuery(
			@PathParam("queryname") String queryName,
			@FormParam("newname") String newName ){
		try{
			String xml = olapQueryService.getQueryXml(queryName);
			if (newName != null) {
				queryName = newName;
			}
			String uri = repoURL.toURI().toString();
			if (uri != null && xml != null) {
				if (!queryName.endsWith(".squery")) {
					queryName += ".squery";
				}
				URL url = new URL(uri + queryName);
				File queryFile = null;
				try {
					queryFile = new File(url.toURI());
				} catch(URISyntaxException e) {
					queryFile = new File(url.getPath());
				}

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
				throw new Exception("Cannot save query because uri or xml is null uri(" 
						+ (uri == null) + ") xml(" + (xml == null) + " )" );
			}
		}
		catch(Exception e){
			log.error("Cannot save query (" + queryName + ")",e);
			return(Status.NOT_FOUND);
		}
	}
	
	@GET
    @Produces({"application/json" })
	@Path("/{queryname}")
	public SaikuQuery loadQuery(@PathParam("queryname") String queryName){
		try{
			String uri = repoURL.toURI().toString();
			if (uri != null) {
				if (!queryName.endsWith(".squery")) {
					queryName += ".squery";
				}
				URL url = new URL(uri + queryName);
				File queryFile = null;
				try {
					queryFile = new File(url.toURI());
				} catch(URISyntaxException e) {
					queryFile = new File(url.getPath());
				}
				if (queryFile.exists()) {
					FileReader fi = new FileReader(queryFile);
					BufferedReader br = new BufferedReader(fi);
					String chunk ="",xml ="";
					while ((chunk = br.readLine()) != null) {
						xml += chunk;
					}
					SaikuQuery squery = olapQueryService.createNewOlapQuery(queryName, xml);
					if (squery != null) {
						return squery;
					}
				}
				else {
					throw new Exception("File does not exist:" + uri);
				}
			}
			else {
				throw new Exception("Cannot save query because uriis null");
			}
		}
		catch(Exception e){
			log.error("Cannot load query (" + queryName + ")",e);
		}
		return null;
	}
}

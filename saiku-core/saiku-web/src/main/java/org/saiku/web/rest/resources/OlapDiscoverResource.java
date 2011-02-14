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

import java.util.ArrayList;
import java.util.List;

import javax.annotation.security.RolesAllowed;
import javax.jws.WebService;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.codehaus.enunciate.rest.annotations.JSONP;
import org.codehaus.enunciate.rest.annotations.RESTEndpoint;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@WebService
@RESTEndpoint
@JSONP
@RolesAllowed (
  "ROLE_USER"
)
@Component
@Path("/saiku/{username}/discover")
@Scope("request")
public class OlapDiscoverResource {

    OlapDiscoverService olapDiscoverService;
    
    private static final Logger log = LoggerFactory.getLogger(OlapDiscoverResource.class);
    
    public void setOlapDiscoverService(OlapDiscoverService olapds) {
        olapDiscoverService = olapds;
    }
    
    /**
     * Returns the datasources available.
     */
    @GET
    @Produces({"application/json" })
     public List<SaikuConnection> getConnections() {
    	try {
			return olapDiscoverService.getAllConnections();
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuConnection>();
		}
    }
    
	@GET
    @Produces({"application/json" })
	@Path("/{connection}/{catalog}/{schema}/{cube}/dimensions")
     public List<SaikuDimension> getDimensions(
    		 @PathParam("connection") String connectionName, 
    		 @PathParam("catalog") String catalogName, 
    		 @PathParam("schema") String schemaName, 
    		 @PathParam("cube") String cubeName) 
    {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getAllDimensions(cube);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuDimension>();
		}
	}
	
	@GET
    @Produces({"application/json" })
	@Path("/{connection}/{catalog}/{schema}/{cube}/dimensions/{dimension}/hierarchies")
     public List<SaikuHierarchy> getDimensionHierarchies(@PathParam("connection") String connectionName, 
    		 									@PathParam("catalog") String catalogName, 
    		 									@PathParam("schema") String schemaName, 
    		 									@PathParam("cube") String cubeName, 
    		 									@PathParam("dimension") String dimensionName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getAllDimensionHierarchies(cube, dimensionName);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuHierarchy>();
		}
	}
	
	@GET
	@Produces({"application/json" })
	@Path("/{connection}/{catalog}/{schema}/{cube}/dimensions/{dimension}/hierarchies/{hierarchy}")
	public List<SaikuLevel> getHierarchy(@PathParam("connection") String connectionName, 
				@PathParam("catalog") String catalogName, 
				@PathParam("schema") String schemaName, 
				@PathParam("cube") String cubeName, 
				@PathParam("dimension") String dimensionName, 
				@PathParam("hierarchy") String hierarchyName)
	{
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getAllHierarchyLevels(cube, dimensionName, hierarchyName);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuLevel>();
		}
	}

	/**
	 * Get level information.
	 * @return 
	 */
	@GET
	@Produces({"application/json" })
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/hierarchy/{hierarchy}/{level}")
	public List<SaikuMember> getLevelMembers(
			@PathParam("connection") String connectionName, 
			@PathParam("catalog") String catalogName, 
			@PathParam("schema") String schemaName, 
			@PathParam("cube") String cubeName, 
			@PathParam("dimension") String dimensionName, 
			@PathParam("hierarchy") String hierarchyName,
			@PathParam("level") String levelName)
	{
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getLevelMembers(cube, dimensionName, hierarchyName, levelName);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuMember>();
		}
	}
   

	@GET
	@Path("/{connection}/{catalog}/{schema}/{cube}/hierarchies/")
    @Produces({"application/xml","application/json" })
     public List<SaikuHierarchy> getCubeHierarchies(@PathParam("connection") String connectionName, 
    		 									@PathParam("catalog") String catalogName, 
    		 									@PathParam("schema") String schemaName, 
    		 									@PathParam("cube") String cubeName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getAllHierarchies(cube);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuHierarchy>();
		}
	}
	
	@GET
	@Path("/{connection}/{catalog}/{schema}/{cube}/measures/")
    @Produces({"application/xml","application/json" })
     public List<SaikuMember> getCubeMeasures(@PathParam("connection") String connectionName, 
    		 									@PathParam("catalog") String catalogName, 
    		 									@PathParam("schema") String schemaName, 
    		 									@PathParam("cube") String cubeName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName);
		try {
			return olapDiscoverService.getMeasures(cube);
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuMember>();
		}
	}

}

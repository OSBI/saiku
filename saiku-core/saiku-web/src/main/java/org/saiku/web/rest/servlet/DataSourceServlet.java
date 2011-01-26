package org.saiku.web.rest.servlet;

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
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;


/**
 * 
 * @author tombarber
 *
 */
@WebService
@RESTEndpoint
@JSONP
@RolesAllowed (
  "ROLE_USER"
)
@Component
@Path("/saiku/{username}/datasources")
@Scope("request")
public class DataSourceServlet {

    OlapDiscoverService olapDiscoverService;
    
    public void setOlapDiscoverService(OlapDiscoverService olapds) {
        olapDiscoverService = olapds;
    }
    
    /**
     * Returns the datasources available.
     */
    @GET
    @Produces({"application/xml","application/json" })
     public List<SaikuConnection> getConnections() {
    	//List<CubeRestPojo> cubes = new RestList<CubeRestPojo>();
    	//for (SaikuCube cube : olapDiscoverService.getAllCubes()) {
    	//	cubes.add(new CubeRestPojo(cube.getConnectionName(), cube.getCubeName(), cube.getCatalog(), cube.getSchema()));
    	//}
        //return cubes;
    	return olapDiscoverService.getAllConnections();
    }
    
	@GET
	@Path("/{connection}/{catalog}/{schema}/{cube}/dimensions")
    @Produces({"application/xml","application/json" })
     public List<SaikuDimension> getDimensions(@PathParam("connection") String connectionName, @PathParam("catalog") String catalogName, @PathParam("schema") String schemaName, @PathParam("cube") String cubeName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName, "");
		return olapDiscoverService.getAllDimensions(cube);
	}
	
	@GET
	@Path("/{connection}/{catalog}/{schema}/{cube}/dimensions/{dimension}")
    @Produces({"application/xml","application/json" })
     public List<SaikuHierarchy> getDimensionHierarchies(@PathParam("connection") String connectionName, 
    		 									@PathParam("catalog") String catalogName, 
    		 									@PathParam("schema") String schemaName, 
    		 									@PathParam("cube") String cubeName, 
    		 									@PathParam("dimension") String dimensionName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName, "");
		return olapDiscoverService.getAllHierarchies(cube, dimensionName);
	}

	@GET
	@Path("/{connection}/{catalog}/{schema}/{cube}/hierarchies/")
    @Produces({"application/xml","application/json" })
     public List<SaikuHierarchy> getCubeHierarchies(@PathParam("connection") String connectionName, 
    		 									@PathParam("catalog") String catalogName, 
    		 									@PathParam("schema") String schemaName, 
    		 									@PathParam("cube") String cubeName) {
		SaikuCube cube = new SaikuCube(connectionName, cubeName, catalogName, schemaName, "");
		return olapDiscoverService.getAllHierarchies(cube);
	}

}

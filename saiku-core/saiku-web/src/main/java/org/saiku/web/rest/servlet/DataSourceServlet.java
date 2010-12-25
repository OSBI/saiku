package org.saiku.web.rest.servlet;

import java.util.List;

import javax.annotation.security.RolesAllowed;
import javax.jws.WebService;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.codehaus.enunciate.rest.annotations.JSONP;
import org.codehaus.enunciate.rest.annotations.RESTEndpoint;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.web.rest.objects.CubeRestPojo;
import org.saiku.web.rest.util.RestList;
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
}

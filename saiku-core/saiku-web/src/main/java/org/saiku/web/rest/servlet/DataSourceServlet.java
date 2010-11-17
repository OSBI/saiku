package org.saiku.web.rest.servlet;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.saiku.olap.dto.SaikuCube;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.web.rest.objects.CubesListRestPojo;
import org.saiku.web.rest.objects.RestList;
import org.saiku.web.rest.objects.CubesListRestPojo.CubeRestPojo;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.sun.jersey.core.hypermedia.HypermediaController;
import com.sun.jersey.core.hypermedia.HypermediaController.LinkType;


/**
 * 
 * @author tombarber
 *
 */
@Component
@Path("/saiku/{username}/datasources")
@Scope("request")
@HypermediaController(
    model=CubesListRestPojo.class,
    linkType=LinkType.LINK_HEADERS
    )
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
     public List<CubeRestPojo> getCubes() {
    	List<CubeRestPojo> cubes = new RestList<CubeRestPojo>();
    	for (SaikuCube cube : olapDiscoverService.getAllCubes()) {
    		cubes.add(new CubeRestPojo(cube.getConnectionName(), cube.getCubeName(), cube.getCatalog(), cube.getSchema()));
    	}
        return cubes;
        
    }
}

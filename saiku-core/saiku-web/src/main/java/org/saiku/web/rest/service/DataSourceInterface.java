package org.saiku.web.rest.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.context.annotation.Scope;



/**
 * 
 * @author tombarber
 *
 */
@Scope("request")
@Path("/saiku/{username}/datasources")
public class DataSourceInterface {

    OlapDiscoverService olapDiscoverService;
    
    public void setOlapDiscoverService(OlapDiscoverService olapds) {
        olapDiscoverService = olapds;
    }
    
    /**
     * Returns the datasources available.
     */
    @GET
    @Produces({"application/xml","application/json" })
     public CubesListRestPojo getCubes() {
        CubesListRestPojo cubes = olapDiscoverService.getAllCubes();
        return cubes;
        
    }
}

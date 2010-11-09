package org.saiku.web.rest.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.test.context.ContextConfiguration;



/**
 * 
 * @author tombarber
 *
 */
@Component
@Scope("singleton")
@Path("/saiku/{username}/datasources")
@ContextConfiguration(locations = { "saiku-beans.xml" })
public class DataSourceInterface {

	@Autowired
	@Qualifier("olapDiscoverService")
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

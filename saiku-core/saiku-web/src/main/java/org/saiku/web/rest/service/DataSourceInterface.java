package org.saiku.web.rest.service;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.xml.bind.annotation.XmlElement;

import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.web.rest.objects.CubeRestPojo;
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
     public CubeRestPojo getCubes() {
        CubeRestPojo cubeList = new CubeRestPojo();
        for(CubePojo cube : olapDiscoverService.getAllCubes()){
            cubeList.addCubeRestPojo(cube);
        }
        
        return cubeList;
        
    }
}

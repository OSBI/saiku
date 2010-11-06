package org.saiku.rest;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.xml.bind.annotation.XmlElement;

import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.rest.objects.CubeRestPojo;
import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.context.annotation.Scope;



/**
 * 
 * @author tombarber
 *
 */
@Scope("request")
@Path("/datasources")
public class DataSourceInterface {

    @XmlElement(name = "datasources", required = true)
    List<CubeRestPojo> cubeList = new ArrayList<CubeRestPojo>();
    
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
        
        for(CubePojo cube : olapDiscoverService.getAllCubes()){
            cubeList.add(new CubeRestPojo(cube));
        }
        
        return cubeList;
        
    }
}

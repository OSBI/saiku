package org.saiku.rest;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.saiku.rest.objects.CubeRestPojo;



/**
 * 
 * @author tombarber
 *
 */
@Path("/{username}/datasources")
public interface DataSourceInterface {

    /**
     * Returns the datasources available.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public List<CubeRestPojo> getCubes();
}

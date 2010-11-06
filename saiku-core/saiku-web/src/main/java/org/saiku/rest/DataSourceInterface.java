package org.saiku.rest;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

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
    public void getDataSources();
}

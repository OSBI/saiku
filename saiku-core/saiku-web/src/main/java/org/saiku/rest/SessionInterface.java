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
public interface SessionInterface {

    /**
     * Creates a session.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public void createSession();
}

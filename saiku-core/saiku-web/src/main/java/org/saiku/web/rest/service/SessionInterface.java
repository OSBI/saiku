package org.saiku.web.rest.service;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

/**
 * 
 * @author tombarber
 *
 */
@Path("/saiku/session")
public class SessionInterface {

    /**
     * Creates a session.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public String createSession() {
        // TODO Auto-generated method stub
        return "HELLO";
    }
}

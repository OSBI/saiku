package org.saiku.plugin.resources;


import org.saiku.web.rest.resources.License;

import javax.ws.rs.Path;

/**
 * Created by bugg on 01/12/14.
 */
@Path("/saiku/api/{username}/license")
public class PentahoLicenseResource extends License {
}

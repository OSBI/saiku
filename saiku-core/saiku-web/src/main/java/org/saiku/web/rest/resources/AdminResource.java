package org.saiku.web.rest.resources;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.user.UserService;
import org.saiku.service.util.dto.User;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.users.SaikuUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created by bugg on 01/05/14.
 */
@Component
@Path("/saiku/admin")
public class AdminResource {

  DatasourceService datasourceService;

  UserService userService;
  private static final Logger log = LoggerFactory.getLogger( DataSourceResource.class );

  public void setDatasourceService(DatasourceService ds) {
    datasourceService = ds;
  }

  public void setUserService(UserService us) {
      userService = us;
  }

  @GET
  @Produces({"application/json" })
  @Path("/datasources")
  public Collection<SaikuDatasource> getAvailableDataSources() {
    try {
      return datasourceService.getDatasources().values();
    } catch (SaikuServiceException e) {
      log.error(this.getClass().getName(),e);
      return new ArrayList<SaikuDatasource>();
    }
  }

  @GET
  @Produces({"application/json" })
  @Path("/users")
  public List<SaikuUser> getExistingUsers() {

    return userService.getUsers();
  }
  @GET
  @Produces({"application/json" })
  @Path("/users")
  public SaikuUser createNewUser(@FormParam("user") SaikuUser file) {
        return userService.addUser(file);
  }

  @GET
  @Produces({"application/json"})
  @Path("/users/{username}")
  public SaikuUser getUserDetails(@PathParam("username") String userName){
      return userService.getUser(userName);
  }
  }

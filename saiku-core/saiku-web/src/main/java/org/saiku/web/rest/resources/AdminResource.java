package org.saiku.web.rest.resources;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.util.dto.User;
import org.saiku.service.util.exception.SaikuServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
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

  private static final Logger log = LoggerFactory.getLogger( DataSourceResource.class );

  public void setDatasourceService(DatasourceService ds) {
    datasourceService = ds;
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
  public List<User> getExistingUsers() {

    return null;
  }
  }

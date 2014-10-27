/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.web.rest.resources;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

import javax.ws.rs.*;
import javax.ws.rs.core.Response.Status;

/**
 * DataSource Resource.
 */
@Component
@Path("/saiku/{username}/org.saiku.datasources")
public class DataSourceResource {

  DatasourceService datasourceService;

  private static final Logger LOG = LoggerFactory.getLogger(DataSourceResource.class);

  public void setDatasourceService(DatasourceService ds) {
    datasourceService = ds;
  }

  /**
   * Get Data Sources.
   *
   * @return A Collection of SaikuDatasource's.
   */
  @GET
  @Produces({ "application/json" })
  public Collection<SaikuDatasource> getDatasources() {
    try {
      return datasourceService.getDatasources().values();
    } catch (SaikuServiceException e) {
      LOG.error(this.getClass().getName(), e);
      return new ArrayList<SaikuDatasource>();
    }
  }

  /**
   * Delete Data Source.
   *
   * @param datasourceName - The name of the data source.
   * @return A GONE Status.
   */
  @DELETE
  @Path("/{datasource}")
  public Status deleteDatasource(@PathParam("datasource") String datasourceName) {
    datasourceService.removeDatasource(datasourceName);
    return Status.GONE;
  }

  /**
   * Get Data Source.
   *
   * @param datasourceName.
   * @return A Saiku Datasource.
   */
  @GET
  @Produces({ "application/json" })
  @Path("/{datasource}")
  public SaikuDatasource getDatasource(@PathParam("datasource") String datasourceName) {
    return datasourceService.getDatasource(datasourceName);
  }

//    @POST
//    @Consumes({"application/json" })
//@Path("/{datasource}")
//public Status addDatasource(@PathParam("datasource") String datasourceName , @Context SaikuDatasource ds){
//    System.out.println("ds not null:" + (ds != null));
//    System.out.println("ds name:"+ds.getName());
//    datasourceService.addDatasource(ds);
//    return Status.OK;
//    }

}

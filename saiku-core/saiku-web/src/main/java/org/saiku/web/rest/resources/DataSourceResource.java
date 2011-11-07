/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.web.rest.resources;

import java.util.ArrayList;
import java.util.Collection;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response.Status;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Path("/saiku/{username}/datasources")
public class DataSourceResource {

    DatasourceService datasourceService;
    
    private static final Logger log = LoggerFactory.getLogger(DataSourceResource.class);
    
    public void setDatasourceService(DatasourceService ds) {
    	datasourceService = ds;
    }
    
    /**
     * Get Data Sources.
     * @return A Collection of SaikuDatasource's.
     */
    @GET
    @Produces({"application/json" })
     public Collection<SaikuDatasource> getDatasources() {
    	try {
			return datasourceService.getDatasources().values();
		} catch (SaikuServiceException e) {
			log.error(this.getClass().getName(),e);
			return new ArrayList<SaikuDatasource>();
		}
    }
    
    /**
     * Delete Data Source.
     * @param datasourceName - The name of the data source.
     * @return A GONE Status.
     */
    @DELETE
	@Path("/{datasource}")
	public Status deleteDatasource(@PathParam("datasource") String datasourceName){
    	datasourceService.removeDatasource(datasourceName);
		return(Status.GONE);
    }
    
    /**
     * Get Data Source.
     * @param datasourceName.
     * @return A Saiku Datasource.
     */
    @GET
    @Produces({"application/json" })
	@Path("/{datasource}")
	public SaikuDatasource getDatasource(@PathParam("datasource") String datasourceName){
    	return datasourceService.getDatasource(datasourceName);
    }

//    @POST
//    @Consumes({"application/json" })
//	@Path("/{datasource}")
//	public Status addDatasource(@PathParam("datasource") String datasourceName , @Context SaikuDatasource ds){
//    	System.out.println("ds not null:" + (ds != null));
//    	System.out.println("ds name:"+ds.getName());
//    	datasourceService.addDatasource(ds);
//    	return Status.OK;
//    }

}

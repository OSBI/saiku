/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.web.rest.resources;

import javax.servlet.ServletException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.ThinQueryService;
import org.saiku.web.rest.objects.resultset.QueryResult;
import org.saiku.web.rest.util.RestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Path("/saiku/api/query")
@XmlAccessorType(XmlAccessType.NONE)
public class Query2Resource {

	private static final Logger log = LoggerFactory.getLogger(Query2Resource.class);

	private ThinQueryService thinQueryService;

	@Autowired
	public void setThinQueryService(ThinQueryService tqs) {
		thinQueryService = tqs;
	}

	private OlapDiscoverService olapDiscoverService;
	private ISaikuRepository repository;
	
	@Autowired
	public void setRepository(ISaikuRepository repository){
		this.repository = repository;
	}



	@Autowired
	public void setOlapDiscoverService(OlapDiscoverService olapds) {
		olapDiscoverService = olapds;
	}

	/**
	 * Delete query from the query pool.
	 * @return a HTTP 410(Works) or HTTP 500(Call failed).
	 */
	@DELETE
	@Path("/{queryname}")
	public Status deleteQuery(@PathParam("queryname") String queryName){
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "\tDELETE");
		}
		try{
			thinQueryService.deleteQuery(queryName);
			return(Status.GONE);
		}
		catch(Exception e){
			log.error("Cannot delete query (" + queryName + ")",e);
			throw new WebApplicationException(e);
		}
	}

	/**
	 * Create a new Saiku Query.
	 * @param connectionName the name of the Saiku connection.
	 * @param cubeName the name of the cube.
	 * @param catalogName the catalog name.
	 * @param schemaName the name of the schema.
	 * @param queryName the name you want to assign to the query.
	 * @return 
	 * 
	 * @return a query model.
	 * 
	 * @see 
	 */
	@POST
	@Produces({"application/json" })
	@Path("/{queryname}")
	public ThinQuery createQuery(@PathParam("queryname") String queryName, MultivaluedMap<String, String> formParams) throws ServletException {
		try {
			ThinQuery tq = null;
			String file = null, 
					json = null;
			if (formParams != null) {
				json = formParams.containsKey("json") ? formParams.getFirst("json") : null;
				file = formParams.containsKey("file") ? formParams.getFirst("file") : null;
				if (StringUtils.isNotBlank(json)) {
					ObjectMapper om = new ObjectMapper();
					tq = om.readValue(json, ThinQuery.class);
					
				} else if (StringUtils.isNotBlank(file)) {
					Response f = repository.getResource(file);
					String tqJson = new String( (byte[]) f.getEntity());
					ObjectMapper om = new ObjectMapper();
					tq = om.readValue(tqJson, ThinQuery.class);
					
				}
			}
			if (log.isDebugEnabled()) {
				log.debug("TRACK\t"  + "\t/query/" + queryName + "\tPOST\t tq:" + (tq == null) + " file:" + (file));
			}
			SaikuCube cube = tq.getCube();
//			if (StringUtils.isNotBlank(xml)) {
//				String query = ServletUtil.replaceParameters(formParams, xml);
//				return thinQueryService.createNewOlapQuery(queryName, query);
//			}
			return thinQueryService.storeQuery(tq);
		} catch (Exception e) {
			throw new WebApplicationException(e);
		}
	}
	
	
	@POST
	@Consumes({"application/json" })
	@Path("/execute")
	public QueryResult execute(ThinQuery tq) {
		try {
			QueryResult qr = RestUtil.convert(thinQueryService.execute(tq));
			ThinQuery tqAfter = thinQueryService.getContext(tq.getName()).getOlapQuery();
			qr.setQuery(tqAfter);
			return qr;
		}
		catch (Exception e) {
			log.error("Cannot execute query (" + tq + ")",e);
			throw new WebApplicationException(e);
		}
	}
	
	@DELETE
	@Path("/{queryname}/cancel")
	public Response cancel(@PathParam("queryname") String queryName){
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "\tDELETE");
		}
		try{
			thinQueryService.cancel(queryName);
			return Response.ok(Status.GONE).build();
		}
		catch(Exception e){
			log.error("Cannot cancel query (" + queryName + ")",e);
			throw new WebApplicationException(e);
		}
	}
	
	@POST
	@Consumes({"application/json" })
	@Path("/enrich")
	public ThinQuery enrich(ThinQuery tq) {
		try {
			ThinQuery tqAfter = thinQueryService.updateQuery(tq);
			return tqAfter;
		}
		catch (Exception e) {
			log.error("Cannot enrich query (" + tq + ")",e);
			throw new WebApplicationException(e);
		}		
	}
	
	
}

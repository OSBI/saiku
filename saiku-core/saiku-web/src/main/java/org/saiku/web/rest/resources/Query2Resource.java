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

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.service.olap.ThinQueryService;
import org.saiku.web.rest.objects.resultset.QueryResult;
import org.saiku.web.rest.util.RestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Path("/saiku/{username}/query2")
@XmlAccessorType(XmlAccessType.NONE)
public class Query2Resource {

	private static final Logger log = LoggerFactory.getLogger(Query2Resource.class);

	private ThinQueryService thinQueryService;

	@Autowired
	public void setThinQueryService(ThinQueryService tqs) {
		thinQueryService = tqs;
	}


	
	@GET
	@Produces({"application/json" })
	@Path("/new")
	public ThinQuery getEmpty() {
		SaikuCube cube = new SaikuCube("foodmart", "Sales", "Sales", "Sales", "FoodMart", "FoodMart");
		return thinQueryService.createEmpty("dummy", cube);
		
	}
	
	@POST
	@Consumes({"application/json" })
	@Path("/execute")
	public Response execute(ThinQuery tq) {
		try {
			QueryResult qr = RestUtil.convert(thinQueryService.execute(tq));
			return Response.ok(qr).type(MediaType.APPLICATION_JSON).build();
		}
		catch (Exception e) {
			log.error("Cannot execute query (" + tq + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			return Response.serverError().entity(error).type(MediaType.TEXT_PLAIN).build();
		}
		
	}
	
}

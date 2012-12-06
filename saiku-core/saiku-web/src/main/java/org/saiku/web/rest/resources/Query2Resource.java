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

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.service.olap.ThinQueryService;
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
	public ThinQuery getDummy() {
		SaikuCube cube = new SaikuCube("foodmart", "Sales", "Sales", "Sales", "FoodMart", "FoodMart");
		return thinQueryService.createDummyQuery(cube);
		
	}
	
	@GET
	@Produces({"application/json" })
	@Path("/new")
	public ThinQuery getEmpty() {
		SaikuCube cube = new SaikuCube("foodmart", "Sales", "Sales", "Sales", "FoodMart", "FoodMart");
		return thinQueryService.createEmpty(cube);
		
	}
}

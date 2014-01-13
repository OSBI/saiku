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

import java.util.List;

import javax.servlet.ServletException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SimpleCubeElement;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.util.SaikuProperties;
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
			String error = ExceptionUtils.getRootCauseMessage(e);
			return new QueryResult(error);
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
			String error = ExceptionUtils.getRootCauseMessage(e);
			throw new WebApplicationException(Response.serverError().entity(error).build());
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
			String error = ExceptionUtils.getRootCauseMessage(e);
			throw new WebApplicationException(Response.serverError().entity(error).build());
		}		
	}
	
	@GET
	@Produces({"application/json" })
	@Path("/{queryname}/result/metadata/hierarchies/{hierarchy}/levels/{level}")
	public List<SimpleCubeElement> getLevelMembers(
			@PathParam("queryname") String queryName, 
			@PathParam("hierarchy") String hierarchyName,
			@PathParam("level") String levelName,
			@QueryParam("result") @DefaultValue("true") boolean result,
			@QueryParam("search") String searchString,
			@QueryParam("searchlimit") @DefaultValue("-1") int searchLimit)
	{
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t" 
					+ "\t/query/" + queryName + "/result/metadata"
					+ "/hierarchies/" + hierarchyName + "/levels/" + levelName + "\tGET");
		}
		try {
			List<SimpleCubeElement> ms = thinQueryService.getResultMetadataMembers(queryName, result, hierarchyName, levelName, searchString, searchLimit);
			return ms;
		}
		catch (Exception e) {
			log.error("Cannot execute query (" + queryName + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			throw new WebApplicationException(Response.serverError().entity(error).build());
		}
	}
	
	
	@GET
	@Produces({"application/vnd.ms-excel" })
	@Path("/{queryname}/export/xls")
	public Response getQueryExcelExport(@PathParam("queryname") String queryName){
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "/export/xls/\tGET");
		}
		return getQueryExcelExport(queryName, "flattened");
	}

	@GET
	@Produces({"application/vnd.ms-excel" })
	@Path("/{queryname}/export/xls/{format}")
	public Response getQueryExcelExport(
			@PathParam("queryname") String queryName,
			@PathParam("format") @DefaultValue("flattened") String format){
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "/export/xls/"+format+"\tGET");
		}
		try {
			byte[] doc = thinQueryService.getExport(queryName,"xls",format);
			String name = SaikuProperties.webExportExcelName + "." + SaikuProperties.webExportExcelFormat;
			return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
					"content-disposition",
					"attachment; filename = " + name).header(
							"content-length",doc.length).build();
		}
		catch (Exception e) {
			log.error("Cannot get excel for query (" + queryName + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			throw new WebApplicationException(Response.serverError().entity(error).build());
		}
	}

	@GET
	@Produces({"text/csv" })
	@Path("/{queryname}/export/csv")
	public Response getQueryCsvExport(@PathParam("queryname") String queryName) {
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "/export/csv\tGET");
		}
		return getQueryCsvExport(queryName, "flattened");
	}

	@GET
	@Produces({"text/csv" })
	@Path("/{queryname}/export/csv/{format}")
	public Response getQueryCsvExport(
			@PathParam("queryname") String queryName,
			@PathParam("format") String format){
		if (log.isDebugEnabled()) {
			log.debug("TRACK\t"  + "\t/query/" + queryName + "/export/csv/"+format+"\tGET");
		}
		try {
			byte[] doc = thinQueryService.getExport(queryName,"csv",format);
			String name = SaikuProperties.webExportCsvName;
			return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
					"content-disposition",
					"attachment; filename = " + name + ".csv").header(
							"content-length",doc.length).build();
		}
		catch (Exception e) {
			log.error("Cannot get csv for query (" + queryName + ")",e);
			String error = ExceptionUtils.getRootCauseMessage(e);
			throw new WebApplicationException(Response.serverError().entity(error).build());
		}
	}
	
	@Deprecated
	@GET
	@Produces({"application/pdf" })
	@Path("/{queryname}/export/pdf")
	public Response exportPdf(@PathParam("queryname")  String queryName)
	{
		return Response.serverError().entity("We should rebuild this using iText").build();
	}

	

	
	
}

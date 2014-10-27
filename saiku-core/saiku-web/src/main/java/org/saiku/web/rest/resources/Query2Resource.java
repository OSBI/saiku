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

import org.saiku.olap.dto.SimpleCubeElement;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.query2.ThinQuery;
import org.saiku.olap.util.SaikuProperties;
import org.saiku.service.olap.ThinQueryService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.export.JSConverter;
import org.saiku.web.export.PdfReport;
import org.saiku.web.rest.objects.resultset.QueryResult;
import org.saiku.web.rest.util.RestUtil;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.type.TypeFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

//import org.springframework.beans.factory.annotation.Autowired;

/**
 * Query2Resource.
 */
@Component
@Path("/saiku/api/query")
@XmlAccessorType(XmlAccessType.NONE)
public class Query2Resource {

  private static final Logger LOG = LoggerFactory.getLogger(Query2Resource.class);

  private ThinQueryService thinQueryService;

  //@Autowired
  public void setThinQueryService(ThinQueryService tqs) {
    thinQueryService = tqs;
  }

  private ISaikuRepository repository;

  //@Autowired
  public void setRepository(ISaikuRepository repository) {
    this.repository = repository;
  }


  /**
   * Delete query from the query pool.
   *
   * @return a HTTP 410(Works) or HTTP 500(Call failed).
   */
  @DELETE
  @Path("/{queryname}")
  public Status deleteQuery(@PathParam("queryname") String queryName) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "\tDELETE");
    }
    try {
      thinQueryService.deleteQuery(queryName);
      return Status.GONE;
    } catch (Exception e) {
      LOG.error("Cannot delete query (" + queryName + ")", e);
      throw new WebApplicationException(e);
    }
  }

  /**
   * Create a new Saiku Query.
   *
   * @param connectionName the name of the Saiku connection.
   * @param cubeName       the name of the cube.
   * @param catalogName    the catalog name.
   * @param schemaName     the name of the schema.
   * @param queryName      the name you want to assign to the query.
   * @return a query model.
   * @see
   */
  @POST
  @Produces({ "application/json" })
  @Path("/{queryname}")
  public ThinQuery createQuery(
      @PathParam("queryname") String queryName,
      @FormParam("json") String jsonFormParam,
      @FormParam("file") String fileFormParam,
      MultivaluedMap<String, String> formParams) throws ServletException {
    try {
      ThinQuery tq = null;
      String file = fileFormParam;
      String json = jsonFormParam;
      if (formParams != null) {
        json = formParams.containsKey("json") ? formParams.getFirst("json") : jsonFormParam;
        file = formParams.containsKey("file") ? formParams.getFirst("file") : fileFormParam;
      }
      String filecontent = null;
      if (StringUtils.isNotBlank(json)) {
        filecontent = json;
      } else if (StringUtils.isNotBlank(file)) {
        Response f = repository.getResource(file);
        filecontent = new String((byte[]) f.getEntity());
      }
      if (StringUtils.isBlank(filecontent)) {
        throw new SaikuServiceException(
            "Cannot create new query. Empty file content " + StringUtils.isNotBlank(json) + " or read from file:"
            + file);
      }
      if (thinQueryService.isOldQuery(filecontent)) {
        tq = thinQueryService.convertQuery(filecontent);
      } else {
        ObjectMapper om = new ObjectMapper();
        tq = om.readValue(filecontent, ThinQuery.class);
      }

      if (LOG.isDebugEnabled()) {
        LOG.debug("TRACK\t" + "\t/query/" + queryName + "\tPOST\t tq:" + (tq == null) + " file:" + file);
      }

      if (tq == null) {
        throw new SaikuServiceException("Cannot create blank query (ThinQuery object = null)");
      }
      tq.setName(queryName);

      //SaikuCube cube = tq.getCube();
      //if (StringUtils.isNotBlank(xml)) {
      //String query = ServletUtil.replaceParameters(formParams, xml);
      //return thinQueryService.createNewOlapQuery(queryName, query);
      //}
      return thinQueryService.createQuery(tq);
    } catch (Exception e) {
      LOG.error("Error creating new query", e);
      throw new WebApplicationException(e);
    }
  }


  @POST
  @Consumes({ "application/json" })
  @Path("/execute")
  public QueryResult execute(ThinQuery tq) {
    try {
      if (thinQueryService.isMdxDrillthrough(tq)) {
        Long start = (new Date()).getTime();
        ResultSet rs = thinQueryService.drillthrough(tq);
        QueryResult rsc = RestUtil.convert(rs);
        rsc.setQuery(tq);
        Long runtime = (new Date()).getTime() - start;
        rsc.setRuntime(runtime.intValue());
        return rsc;
      }

      QueryResult qr = RestUtil.convert(thinQueryService.execute(tq));
      ThinQuery tqAfter = thinQueryService.getContext(tq.getName()).getOlapQuery();
      qr.setQuery(tqAfter);
      return qr;
    } catch (Exception e) {
      LOG.error("Cannot execute query (" + tq + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      return new QueryResult(error);
    }
  }

  @DELETE
  @Path("/{queryname}/cancel")
  public Response cancel(@PathParam("queryname") String queryName) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "\tDELETE");
    }
    try {
      thinQueryService.cancel(queryName);
      return Response.ok(Status.GONE).build();
    } catch (Exception e) {
      LOG.error("Cannot cancel query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());
    }
  }

  @POST
  @Consumes({ "application/json" })
  @Path("/enrich")
  public ThinQuery enrich(ThinQuery tq) {
    try {
      ThinQuery tqAfter = thinQueryService.updateQuery(tq);
      return tqAfter;
    } catch (Exception e) {
      LOG.error("Cannot enrich query (" + tq + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());
    }
  }

  @GET
  @Produces({ "application/json" })
  @Path("/{queryname}/result/metadata/hierarchies/{hierarchy}/levels/{level}")
  public List<SimpleCubeElement> getLevelMembers(
      @PathParam("queryname") String queryName,
      @PathParam("hierarchy") String hierarchyName,
      @PathParam("level") String levelName,
      @QueryParam("result") @DefaultValue("true") boolean result,
      @QueryParam("search") String searchString,
      @QueryParam("searchlimit") @DefaultValue("-1") int searchLimit) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t"
                + "\t/query/" + queryName + "/result/metadata"
                + "/hierarchies/" + hierarchyName + "/levels/" + levelName + "\tGET");
    }
    try {
      List<SimpleCubeElement> ms = thinQueryService
          .getResultMetadataMembers(queryName, result, hierarchyName, levelName, searchString, searchLimit);
      return ms;
    } catch (Exception e) {
      LOG.error("Cannot execute query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());
    }
  }


  @GET
  @Produces({ "application/vnd.ms-excel" })
  @Path("/{queryname}/export/xls")
  public Response getQueryExcelExport(@PathParam("queryname") String queryName) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/export/xls/\tGET");
    }
    return getQueryExcelExport(queryName, "flattened");
  }

  @GET
  @Produces({ "application/vnd.ms-excel" })
  @Path("/{queryname}/export/xls/{format}")
  public Response getQueryExcelExport(
      @PathParam("queryname") String queryName,
      @PathParam("format") @DefaultValue("flattened") String format) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/export/xls/" + format + "\tGET");
    }
    try {
      byte[] doc = thinQueryService.getExport(queryName, "xls", format);
      String name = SaikuProperties.WEBEXPORTEXCELNAME + "." + SaikuProperties.WEBEXPORTEXCELFORMAT;
      return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
          "content-disposition",
          "attachment; filename = " + name).header(
          "content-length", doc.length).build();
    } catch (Exception e) {
      LOG.error("Cannot get excel for query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());
    }
  }

  @GET
  @Produces({ "text/csv" })
  @Path("/{queryname}/export/csv")
  public Response getQueryCsvExport(@PathParam("queryname") String queryName) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/export/csv\tGET");
    }
    return getQueryCsvExport(queryName, "flattened");
  }

  @GET
  @Produces({ "text/csv" })
  @Path("/{queryname}/export/csv/{format}")
  public Response getQueryCsvExport(
      @PathParam("queryname") String queryName,
      @PathParam("format") String format) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/export/csv/" + format + "\tGET");
    }
    try {
      byte[] doc = thinQueryService.getExport(queryName, "csv", format);
      String name = SaikuProperties.WEBEXPORTCSVNAME;
      return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
          "content-disposition",
          "attachment; filename = " + name + ".csv").header(
          "content-length", doc.length).build();
    } catch (Exception e) {
      LOG.error("Cannot get csv for query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());
    }
  }

  @PUT
  @Consumes("application/x-www-form-urlencoded")
  @Path("/{queryname}/zoomin")
  public ThinQuery zoomIn(
      @PathParam("queryname") String queryName,
      @FormParam("selections") String positionListString) {
    try {

      if (LOG.isDebugEnabled()) {
        LOG.debug("TRACK\t" + "\t/query/" + queryName + "/zoomIn\tPUT");
      }
      List<List<Integer>> realPositions = new ArrayList<List<Integer>>();
      if (StringUtils.isNotBlank(positionListString)) {
        ObjectMapper mapper = new ObjectMapper();
        String[] positions = mapper.readValue(positionListString, TypeFactory.arrayType(String.class));
        if (positions != null && positions.length > 0) {
          for (String position : positions) {
            String[] rPos = position.split(":");
            List<Integer> cellPosition = new ArrayList<Integer>();

            for (String p : rPos) {
              Integer pInt = Integer.parseInt(p);
              cellPosition.add(pInt);
            }
            realPositions.add(cellPosition);
          }
        }
      }
      ThinQuery tq = thinQueryService.zoomIn(queryName, realPositions);
      return tq;

    } catch (Exception e) {
      LOG.error("Cannot zoom in on query (" + queryName + ")", e);
      throw new WebApplicationException(e);
    }
  }

  @GET
  @Produces({ "application/json" })
  @Path("/{queryname}/drillthrough")
  public QueryResult drillthrough(
      @PathParam("queryname") String queryName,
      @QueryParam("maxrows") @DefaultValue("100") Integer maxrows,
      @QueryParam("position") String position,
      @QueryParam("returns") String returns) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/drillthrough\tGET");
    }
    QueryResult rsc;
    ResultSet rs = null;
    try {
      Long start = (new Date()).getTime();
      if (position == null) {
        rs = thinQueryService.drillthrough(queryName, maxrows, returns);
      } else {
        String[] positions = position.split(":");
        List<Integer> cellPosition = new ArrayList<Integer>();

        for (String p : positions) {
          Integer pInt = Integer.parseInt(p);
          cellPosition.add(pInt);
        }

        rs = thinQueryService.drillthrough(queryName, cellPosition, maxrows, returns);
      }
      rsc = RestUtil.convert(rs);
      Long runtime = (new Date()).getTime() - start;
      rsc.setRuntime(runtime.intValue());

    } catch (Exception e) {
      LOG.error("Cannot execute query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      rsc = new QueryResult(error);

    } finally {
      if (rs != null) {
        Statement statement = null;
        Connection con = null;
        try {
          statement = rs.getStatement();
          con = rs.getStatement().getConnection();
        } catch (Exception e) {
          throw new SaikuServiceException(e);
        } finally {
          try {
            rs.close();
            if (statement != null) {
              statement.close();
            }
          } catch (Exception ee) {
            LOG.error("Could not close statement", ee);
          }

          rs = null;
        }
      }
    }
    return rsc;

  }


  @GET
  @Produces({ "text/csv" })
  @Path("/{queryname}/drillthrough/export/csv")
  public Response getDrillthroughExport(
      @PathParam("queryname") String queryName,
      @QueryParam("maxrows") @DefaultValue("100") Integer maxrows,
      @QueryParam("position") String position,
      @QueryParam("returns") String returns) {
    if (LOG.isDebugEnabled()) {
      LOG.debug(
          "TRACK\t" + "\t/query/" + queryName + "/drillthrough/export/csv (maxrows:" + maxrows + " position" + position
          + ")\tGET");
    }
    ResultSet rs = null;

    try {
      if (position == null) {
        rs = thinQueryService.drillthrough(queryName, maxrows, returns);
      } else {
        String[] positions = position.split(":");
        List<Integer> cellPosition = new ArrayList<Integer>();

        for (String p : positions) {
          Integer pInt = Integer.parseInt(p);
          cellPosition.add(pInt);
        }

        rs = thinQueryService.drillthrough(queryName, cellPosition, maxrows, returns);
      }
      byte[] doc = thinQueryService.exportResultSetCsv(rs);
      String name = SaikuProperties.WEBEXPORTCSVNAME;
      return Response.ok(doc, MediaType.APPLICATION_OCTET_STREAM).header(
          "content-disposition",
          "attachment; filename = " + name + "-drillthrough.csv").header(
          "content-length", doc.length).build();


    } catch (Exception e) {
      LOG.error("Cannot export drillthrough query (" + queryName + ")", e);
      return Response.serverError().build();
    } finally {
      if (rs != null) {
        try {
          Statement statement = rs.getStatement();
          statement.close();
          rs.close();
        } catch (SQLException e) {
          throw new SaikuServiceException(e);
        } finally {
          rs = null;
        }
      }
    }


  }

  @POST
  @Produces({ "application/pdf" })
  @Path("/{queryname}/export/pdf")
  public Response exportPdfWithChart(
      @PathParam("queryname") String queryName,
      @PathParam("svg") @DefaultValue("") String svg) {
    return exportPdfWithChartAndFormat(queryName, null, svg);
  }

  @GET
  @Produces({ "application/pdf" })
  @Path("/{queryname}/export/pdf")
  public Response exportPdf(@PathParam("queryname") String queryName) {
    return exportPdfWithChartAndFormat(queryName, null, null);
  }

  @GET
  @Produces({ "application/pdf" })
  @Path("/{queryname}/export/pdf/{format}")
  public Response exportPdfWithFormat(
      @PathParam("queryname") String queryName,
      @PathParam("format") String format) {
    return exportPdfWithChartAndFormat(queryName, format, null);
  }

  @POST
  @Produces({ "application/pdf" })
  @Path("/{queryname}/export/pdf/{format}")
  public Response exportPdfWithChartAndFormat(
      @PathParam("queryname") String queryName,
      @PathParam("format") String format,
      @FormParam("svg") @DefaultValue("") String svg) {

    try {
      CellDataSet cs = thinQueryService.getFormattedResult(queryName, format);
      QueryResult qr = RestUtil.convert(cs);
      PdfReport pdf = new PdfReport();
      byte[] doc = pdf.pdf(qr, svg);
      return Response.ok(doc).type("application/pdf").header(
          "content-disposition",
          "attachment; filename = export.pdf").header(
          "content-length", doc.length).build();
    } catch (Exception e) {
      LOG.error("Error exporting query to  PDF", e);
      return Response.serverError().entity(e.getMessage()).status(Status.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GET
  @Produces({ "text/html" })
  @Path("/{queryname}/export/html")
  public Response exportHtml(
      @PathParam("queryname") String queryname,
      @QueryParam("format") String format,
      @QueryParam("css") @DefaultValue("false") Boolean css,
      @QueryParam("tableonly") @DefaultValue("false") Boolean tableonly,
      @QueryParam("wrapcontent") @DefaultValue("true") Boolean wrapcontent) {
    ThinQuery tq = thinQueryService.getContext(queryname).getOlapQuery();
    return exportHtml(tq, format, css, tableonly, wrapcontent);
  }

  @POST
  @Produces({ "text/html" })
  @Path("/export/html")
  public Response exportHtml(
      ThinQuery tq,
      @QueryParam("format") String format,
      @QueryParam("css") @DefaultValue("false") Boolean css,
      @QueryParam("tableonly") @DefaultValue("false") Boolean tableonly,
      @QueryParam("wrapcontent") @DefaultValue("true") Boolean wrapcontent) {

    try {
      CellDataSet cs = null;
      if (StringUtils.isNotBlank(format)) {
        cs = thinQueryService.execute(tq, format);
      } else {
        cs = thinQueryService.execute(tq);
      }
      QueryResult qr = RestUtil.convert(cs);
      String content = JSConverter.convertToHtml(qr, wrapcontent);
      String html = "";
      if (!tableonly) {
        html += "<!DOCTYPE html><html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n";
        if (css) {
          html += "<style>\n";
          InputStream is = JSConverter.class.getResourceAsStream("saiku.table.full.css");
          String cssContent = IOUtils.toString(is);
          html += cssContent;
          html += "</style>\n";
        }
        html += "</head>\n<body><div class='workspace_results'>\n";
      }
      html += content;
      if (!tableonly) {
        html += "\n</div></body></html>";
      }
      return Response.ok(html).build();
    } catch (Exception e) {
      LOG.error("Error exporting query to  HTML", e);
      return Response.serverError().entity(e.getMessage()).status(Status.INTERNAL_SERVER_ERROR).build();
    }
  }

  @POST
  @Produces({ "application/json" })
  @Path("/{queryname}/drillacross")
  public ThinQuery drillacross(
      @PathParam("queryname") String queryName,
      @FormParam("position") String position,
      @FormParam("drill") String returns) {
    if (LOG.isDebugEnabled()) {
      LOG.debug("TRACK\t" + "\t/query/" + queryName + "/drillacross\tPOST");
    }

    try {
      String[] positions = position.split(":");
      List<Integer> cellPosition = new ArrayList<Integer>();
      for (String p : positions) {
        Integer pInt = Integer.parseInt(p);
        cellPosition.add(pInt);
      }
      ObjectMapper mapper = new ObjectMapper();
      Map<String, List<String>> levels = mapper.readValue(returns, TypeFactory
          .mapType(Map.class, TypeFactory.fromClass(String.class),
              TypeFactory.collectionType(ArrayList.class, String.class)));
      ThinQuery q = thinQueryService.drillacross(queryName, cellPosition, levels);
      return q;

    } catch (Exception e) {
      LOG.error("Cannot execute query (" + queryName + ")", e);
      String error = ExceptionUtils.getRootCauseMessage(e);
      throw new WebApplicationException(Response.serverError().entity(error).build());

    }
  }


}

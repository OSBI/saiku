package org.saiku.web.rest.resources;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;
import org.saiku.database.dto.SaikuUser;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.user.UserService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.rest.objects.DataSourceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * AdminResource for the Saiku 3.0+ Admin console
 */
@Component
@Path("/saiku/admin")
public class AdminResource {

    DatasourceService datasourceService;

    UserService userService;
    private static final Logger log = LoggerFactory.getLogger(DataSourceResource.class);
    private OlapDiscoverService olapDiscoverService;

    public void setOlapDiscoverService(OlapDiscoverService olapDiscoverService) {
        this.olapDiscoverService = olapDiscoverService;
    }

    public void setDatasourceService(DatasourceService ds) {
        datasourceService = ds;
    }

    public void setUserService(UserService us) {
        userService = us;
    }

    @GET
    @Produces( {"application/json"})
    @Path("/datasources")
    public Response getAvailableDataSources() {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        List<DataSourceMapper> l = new ArrayList<DataSourceMapper>();
        try {
            for (SaikuDatasource d : datasourceService.getDatasources().values()) {
                l.add(new DataSourceMapper(d));
            }
            return Response.ok().entity(l).build();
        } catch (SaikuServiceException e) {
            log.error(this.getClass().getName(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getLocalizedMessage()).type("text/plain").build();
        }
    }

    @PUT
    @Produces( {"application/json"})
    @Consumes( {"application/json"})
    @Path("/datasources/{id}")
    public Response updateDatasource(DataSourceMapper json, @PathParam("id") String id) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        try {
            datasourceService.addDatasource( json.toSaikuDataSource(), true );
            return Response.ok().build();
        }
        catch (Exception e){
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getLocalizedMessage())
                    .type("text/plain").build();
        }
    }

    @GET
    @Produces( {"application/json"})
    @Path("/datasources/{id}/refresh")
    public Response refreshDatasource(@PathParam("id") String id) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        try {
            olapDiscoverService.refreshConnection(id);
            return Response.ok().entity(olapDiscoverService.getConnection(id)).type("application/json").build();
        } catch (Exception e) {
            log.error(this.getClass().getName(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getLocalizedMessage())
                    .type("text/plain").build();
        }

    }

    @POST
    @Produces( {"application/json"})
    @Consumes( {"application/json"})
    @Path("/datasources")
    public Response createDatasource(DataSourceMapper json) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        try {
            datasourceService.addDatasource(json.toSaikuDataSource(), false);
            return Response.ok().entity(json).type("application/json").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(e.getLocalizedMessage())
                    .type("text/plain").build();
        }
    }

    @DELETE
    @Path("/datasources/{id}")
    public Response deleteDatasource(@PathParam("id") String id) {

        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        datasourceService.removeDatasource(id);
        return Response.ok().build();
    }

    @GET
    @Produces( {"application/json"})
    @Path("/schema")
    public Response getAvailableSchema() {

        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok().entity(datasourceService.getAvailableSchema()).build();
    }

    @PUT
    @Produces( {"application/json"})
    @Consumes("multipart/form-data")
    @Path("/schema/{id}")
    public Response uploadSchemaPut(@FormDataParam("file") InputStream is, @FormDataParam("file") FormDataContentDisposition detail,
                                 @FormDataParam("name") String name, @PathParam("id") String id) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        String path = "/datasources/" + name + ".xml";
        String schema = getStringFromInputStream(is);
        try {
            datasourceService.addSchema(schema, path, name);
            return Response.ok().entity(datasourceService.getAvailableSchema()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(e.getLocalizedMessage())
                    .type("text/plain").build();
        }

    }

    @POST
    @Produces( {"application/json"})
    @Consumes("multipart/form-data")
    @Path("/schema/{id}")
    public Response uploadSchema(@FormDataParam("file") InputStream is, @FormDataParam("file") FormDataContentDisposition detail,
                                 @FormDataParam("name") String name, @PathParam("id") String id) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        String path = "/datasources/" + name + ".xml";
        String schema = getStringFromInputStream(is);
        try {
            datasourceService.addSchema(schema, path, name);
            return Response.ok().entity(datasourceService.getAvailableSchema()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(e.getLocalizedMessage())
                    .type("text/plain").build();
        }

    }

    @GET
    @Produces( {"application/json"})
    @Path("/users")
    public Response getExistingUsers() {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok().entity(userService.getUsers()).build();

    }

    @DELETE
    @Path("/schema/{id}")
    public void deleteSchema(@PathParam("id") String id) {
        datasourceService.removeSchema(id);
    }

    @GET
    @Path("/datasource/import")
    public Response importLegacyDatasources() {

        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        datasourceService.importLegacyDatasources();
        return Response.ok().build();
    }

    @GET
    @Path("/schema/import")
    public Response importLegacySchema() {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        datasourceService.importLegacySchema();
        return Response.ok().build();
    }

    @GET
    @Path("/users/import")
    public Response importLegacyUsers() {

        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        datasourceService.importLegacyUsers();
        return Response.ok().build();
    }

    @GET
    @Produces( {"application/json"})
    @Path("/users/{id}")
    public Response getUserDetails(@PathParam("id") int id) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok().entity(userService.getUser(id)).build();
    }

    @PUT
    @Produces( {"application/json"})
    @Consumes("application/json")
    @Path("/users/{username}")
    public Response updateUserDetails(SaikuUser jsonString, @PathParam("username") String userName) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok().entity(userService.updateUser(jsonString)).build();
    }

    @POST
    @Produces( {"application/json"})
    @Consumes( {"application/json"})
    @Path("/users")
    public Response createUserDetails(SaikuUser jsonString) {

        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok().entity(userService.addUser(jsonString)).build();
    }

    @DELETE
    @Produces( {"application/json"})
    @Path("/users/{username}")
    public Response removeUser(@PathParam("username") String username) {
        if(!userService.isAdmin()){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        userService.removeUser(username);
        return Response.ok().build();
    }

    private static String getStringFromInputStream(InputStream is) {

        BufferedReader br = null;
        StringBuilder sb = new StringBuilder();

        String line;
        try {

            br = new BufferedReader(new InputStreamReader(is));
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }

        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return sb.toString();

    }

    @GET
    @Produces("text/plain")
    @Path("/version")
    public Response getVersion(){
        Properties prop = new Properties();
        InputStream input = null;
        String version = "";
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream("org/saiku/web/rest/resources/version.properties");
        try {

            //input = new FileInputStream("version.properties");

            // load a properties file
            prop.load(is);

            // get the property value and print it out
            System.out.println(prop.getProperty("VERSION"));
            version = prop.getProperty("VERSION");
        } catch (IOException ex) {
            ex.printStackTrace();
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return Response.ok().entity(version).type("text/plain").build();
    }

}

package org.saiku.web.rest.resources;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;
import org.saiku.database.dto.MondrianSchema;
import org.saiku.database.dto.SaikuUser;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.user.UserService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.rest.objects.DataSourceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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
  public Collection<DataSourceMapper> getAvailableDataSources() {
      List<DataSourceMapper> l = new ArrayList<DataSourceMapper>();
    try {
      for(SaikuDatasource d : datasourceService.getDatasources().values()){
           l.add(new DataSourceMapper(d));
      }
        return l;
    } catch (SaikuServiceException e) {
      log.error(this.getClass().getName(),e);
      return new ArrayList<DataSourceMapper>();
    }
  }

  @PUT
  @Produces({"application/json"})
  @Consumes({"application/json"})
  @Path("/datasources/{id}")
  public DataSourceMapper updateDatasource(DataSourceMapper json, @PathParam("id") int id){
      return null;

  }

  @POST
  @Produces({"application/json"})
  @Consumes({"application/json"})
  @Path("/datasources")
  public DataSourceMapper createDatasource(DataSourceMapper json){
      datasourceService.addDatasource(json.toSaikuDataSource());
      return json;
  }

  @GET
  @Produces({"application/json"})
  @Path("/schema")
  public List<MondrianSchema> getAvailableSchema(){
      return datasourceService.getAvailableSchema();
  }

  @POST
  @Produces({"application/json"})
  @Consumes("multipart/form-data")
  @Path("/schema")
  public void uploadSchema(@FormDataParam("file") InputStream is, @FormDataParam("file")FormDataContentDisposition detail,
                           @FormDataParam("name") String name){

      String path = "/datasources/"+name+".xml";
      String schema = getStringFromInputStream(is);
      datasourceService.addSchema(schema, path, name);

  }

  @GET
  @Produces({"application/json" })
  @Path("/users")
  public List<SaikuUser> getExistingUsers() {

    return userService.getUsers();

  }
  /*@POST
  @Produces({"application/json" })
  @Path("/users")
  public SaikuUser createNewUser(@FormParam("user") SaikuUser file) {
        return null;// userService.addUser(null);
  }*/

  @GET
  @Produces({"application/json"})
  @Path("/users/{id}")
  public SaikuUser getUserDetails(@PathParam("id") int id){
      return userService.getUser(id);
  }

  @PUT
  @Produces({"application/json" })
  @Consumes("application/json")
  @Path("/users/{username}")
  public SaikuUser updateUserDetails(SaikuUser jsonString, @PathParam("username") String userName){
      return userService.addUser(jsonString);
  }

    @POST
    @Produces({"application/json" })
    @Consumes({"application/json" })
    @Path("/users")
    public SaikuUser createUserDetails(SaikuUser jsonString){
        return userService.addUser(jsonString);
    }

    @DELETE
    @Produces({"application/json"})
    @Path("/users/{username}")
    public boolean removeUser(@PathParam("username") String username){
        userService.removeUser(username);
        return true;
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

  }

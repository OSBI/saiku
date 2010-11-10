package org.saiku.web.rest.service;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import org.saiku.olap.discover.pojo.CubesListRestPojo;
import org.saiku.olap.discover.pojo.CubesListRestPojo.CubeRestPojo;
import org.saiku.olap.query.OlapQuery;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * 
 * @author tombarber
 *
 */
@Path("/rest/{username}/query")
public class QueryInterface {

    
    OlapQueryService olapQueryService;
    
    @Autowired
   public void setOlapDiscoverService(OlapQueryService olapqs) {
        olapQueryService = olapqs;
    }
   
   OlapDiscoverService olapDiscoverService;
   
   @Autowired
   public void setOlapDiscoverService(OlapDiscoverService olapds) {
        olapDiscoverService = olapds;
    }
    /*
     * Query methods
     */
    
//    /**
//     * Get a list of open queries.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    public void listQueries();
//    
//    /**
//     * Save a query.
//     */
//    @PUT
//    @Path("/{queryname}")
//    public void saveQuery();
//    
//    /**
//     * Delete query.
//     */
//    @DELETE
//    @Path("/{queryname}")
//    public void deleteQuery();
//    
    /**
     * Create Query.
     */
      @POST
      @Produces({"application/xml","application/json" })
      @Path("/{queryname}")
      public OlapQuery createQuery(@PathParam("queryname") String queryName, @QueryParam("connectionName") String connectionName, 
              @QueryParam("schemaName") String schemaName, @QueryParam("cubeName") String cubeName ){
          CubeRestPojo cube = null;
          CubesListRestPojo cubes = olapDiscoverService.getAllCubes();
          for(CubeRestPojo cubePojo : cubes.getCubeList()){
              if(cubePojo.getConnectionName().equals(connectionName) && cubePojo.getSchema().equals(schemaName) && cubePojo.getCubeName().equals(cubeName)){
                  cube = cubePojo;
                  break;
              }
          }
          if(cube != null){
          olapQueryService.createNewOlapQuery(queryName, cube);
          return null; //query model
          }
          else{
              throw new WebApplicationException(Response.Status.NOT_FOUND);
          }
          
          
      }
//    
//    /*
//     * Axis Methods.
//     */
//    
//    /**
//     * Get Axis Info.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    @Path("/{queryname}/{axis}")
//    public void getAxisInfo();
//    
//    /*
//     * Dimension Methods
//     */
//    
//    /**
//     * Get Dimension Info.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    @Path("/{queryname}/{axis}/{dimension}")
//    public void getDimensionInfo();
//    
//    /**
//     * Update a dimension.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}")
//    public void updateDimension();
//    
//    /**
//     * Move a dimension.
//     */
//    @POST
//    @Path("/{queryname}/{axis}/{dimension}")
//    public void moveDimension();
//    
//    /**
//     * Delete a dimension.
//     */
//    @DELETE
//    @Path("/{queryname}/{axis}/{dimension}")
//    public void deleteDimension();
//    
//    /*
//     * Hierarchy Methods
//     */
//    
//    /**
//     * Get hierarchy info.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
//    public void getHierarchyInfo();
//    
//    /**
//     * Update a hierarchy.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
//    public void updateHierarchy();
//    
//    /**
//     * Move a hierarchy.
//     */
//    @POST
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
//    public void moveHierarchy();
//    
//    /**
//     * Delete a hierarchy.
//     */
//    @DELETE
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void deleteHierarchy();
//    
//    /*
//     * Level Methods 
//     */
//    
//    /**
//     * Get level information.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void getLevelInfo();
//    
//    /**
//     * Update a level.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void updateLevel();
//    
//    /**
//     * Move a level.
//     */
//    @POST
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void moveLevel();
//    
//    /**
//     * Delete a level.
//     */
//    @DELETE
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void deleteLevel();
//    
//    /*
//     * Member Methods
//     */
//    
//    /**
//     * Get member information.
//     */
//    @GET
//    @Produces({"application/xml","application/json" })
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
//    public void getMemberInfo();
//    
//    /**
//     * Update member.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
//    public void updateMember();
//    
//    /**
//     * Move a member.
//     */
//    @POST
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
//    public void moveMember();
//    
//    /**
//     * Delete a member.
//     */
//    @DELETE
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
//    public void deleteMember();
//    
//    
//    public void createQuery() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void deleteDimension() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void deleteQuery() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void getAxisInfo() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void getDimensionInfo() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void listQueries() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void moveDimension() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void saveQuery() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void updateDimension() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void deleteHierarchy() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void deleteLevel() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void deleteMember() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void getHierarchyInfo() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void getLevelInfo() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void getMemberInfo() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void moveHierarchy() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void moveLevel() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void moveMember() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void updateHierarchy() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void updateLevel() {
//        // TODO Auto-generated method stub
//        
//    }
//
//    public void updateMember() {
//        // TODO Auto-generated method stub
//        
//    }
}

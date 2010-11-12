package org.saiku.web.rest.servlet;

import javax.servlet.ServletException;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.QueryListRestPojo;
import org.saiku.web.rest.objects.CubesListRestPojo.CubeRestPojo;
import org.saiku.web.rest.objects.QueryListRestPojo.QueryRestPojo;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * 
 * @author tombarber
 *
 */
@Component
@Path("/query")
@Scope("request")
public class QueryServlet {

    private OlapQueryService olapQueryService;
    
    public void setOlapQueryService(OlapQueryService olapQueryService) {
    	System.out.println("set olap:" + olapQueryService);
    	this.olapQueryService = olapQueryService;
     }
    
    /*
     * Query methods
     */
    
    /**
     * Get a list of open queries.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public QueryListRestPojo listQueries() {
    	QueryListRestPojo queryList = new QueryListRestPojo();
    	for (String queryName : olapQueryService.getQueries()) {
    		queryList.addQuery(new QueryRestPojo(queryName));
    	}
    	queryList.addQuery(new QueryRestPojo("hugo"));
    	return queryList;
    }
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
      public void createQuery(@FormParam("connection") String connectionName, @FormParam("cube") String cubeName,
          @FormParam("catalog") String catalog, @PathParam("schema") String schema, @PathParam("queryname") String queryName)
          throws ServletException {
    	  CubeRestPojo cube = new CubeRestPojo(connectionName, cubeName, catalog, schema);
          olapQueryService.createNewOlapQuery(queryName, cube.toNativeObject());
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

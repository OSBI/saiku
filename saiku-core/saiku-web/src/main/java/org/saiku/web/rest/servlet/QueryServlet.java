package org.saiku.web.rest.servlet;

import java.util.List;

import javax.servlet.ServletException;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.CubeRestPojo;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.LevelRestPojo;
import org.saiku.web.rest.objects.MemberRestPojo;
import org.saiku.web.rest.objects.QueryRestPojo;
import org.saiku.web.rest.objects.RestList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Tom Barber
 *
 */
@Component
@Path("/saiku/{username}/query")
@Scope("request")
@XmlAccessorType(XmlAccessType.NONE)
public class QueryServlet {

    private OlapQueryService olapQueryService;
    
    public void setOlapQueryService(OlapQueryService olapQueryService) {
    	System.out.println("set olap:" + olapQueryService);
    	this.olapQueryService = olapQueryService;
     }
    
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
    
    /**
     * Return a list of open queries.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public List<QueryRestPojo> listQueries() {
    	RestList<QueryRestPojo> queryList = new RestList<QueryRestPojo>();
    	for (String queryName : olapQueryService.getQueries()) {
    		queryList.add(new QueryRestPojo(queryName));
    	}
    	queryList.add(new QueryRestPojo("hugo"));
    	queryList.add(new QueryRestPojo("hugo2"));
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
    /**
     * Delete query from the query pool.
     * @return a HTTP 410(Works) or HTTP 404(Call failed).
     */
    @DELETE
    @Path("/{queryname}")
    public Status deleteQuery(@PathParam("queryname") String queryName){
    	try{
    	olapQueryService.deleteQuery(queryName);
    	return(Status.GONE);
    	}
    	catch(Exception e){
    		return(Status.NOT_FOUND);
    	}
    }
    
    /**
     * Create a new Saiku Query.
     * @param connectionName the name of the Saiku connection.
     * @param cubeName the name of the cube.
     * @param catalogName the catalog name.
     * @param schemaName the name of the schema.
     * @param queryName the name you want to assign to the query.
     * 
     * @return a query model.
     * 
     * @see 
     */
      @POST
      @Produces({"application/xml","application/json" })
      @Path("/{queryname}")
      public void createQuery(@FormParam("connection") String connectionName, @FormParam("cube") String cubeName,
          @FormParam("catalog") String catalogName, @FormParam("schema") String schemaName, @PathParam("queryname") String queryName)
          throws ServletException {
    	  CubeRestPojo cube = new CubeRestPojo(connectionName, cubeName, catalogName, schemaName);
          olapQueryService.createNewOlapQuery(queryName, cube.toNativeObject());
      }
    
    /*
     * Axis Methods.
     */
    
    /**
     * Return a list of dimensions for an axis in a query.
     * @param queryName the name of the query.
     * @param axisName the name of the axis.
     * @return a list of available dimensions.
     * @see DimensionRestPojo
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}")
    public List<DimensionRestPojo> getAxisInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName){
    	List<DimensionRestPojo> dimensions = new RestList<DimensionRestPojo>();
    	for (String dimension : olapQueryService.getDimensions(queryName, axisName)) {
    		dimensions.add(new DimensionRestPojo(dimension));
    	}
    	return dimensions;
    }
    
    /*
     * Dimension Methods
     */
    
    /**
     * Returns a list of hierarchies from a dimension.
     * @param queryName the name of the query.
     * @param axisName the name of the axis.
     * @param dimensionName the name of the dimension.
     * 
     * @return a list of available hierarchies.
     * 
     * @see HierarchyRestPojo
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}")
    public List<HierarchyRestPojo> getDimensionInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
        List<HierarchyRestPojo> hierarchies = new RestList<HierarchyRestPojo>();
        for (String hierarchy : olapQueryService.getHierarchies(queryName, dimensionName)) {
            hierarchies.add(new HierarchyRestPojo(hierarchy));
        }
        return hierarchies;
    }
    
//    /**
//     * Update a dimension.
//     * @return 
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}")
//    public Status updateDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
//        return null;
//        
//        
//    }
//    
    /**
     * Move a dimension from one axis to another.
     * @param queryName the name of the query.
     * @param axisName the name of the axis.
     * @param dimensionName the name of the dimension. 
     * 
     * @return HTTP 200 or HTTP 500.
     * 
     * @see Status
     */
    @POST
    @Path("/{queryname}/{axis}/{dimension}")
    public Status moveDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
    try{
        olapQueryService.moveDimension(queryName, axisName, dimensionName);
        return Status.OK;
        }catch(Exception e){
            return Status.INTERNAL_SERVER_ERROR;
        }
}
    
    /**
     * Delete a dimension.
     * @return 
     */
    @DELETE
    @Path("/{queryname}/{axis}/{dimension}")
    public Status deleteDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
        try{
            olapQueryService.moveDimension(queryName, "UNUSED", dimensionName);
            return Status.OK;
            }catch(Exception e){
                return Status.INTERNAL_SERVER_ERROR;
            }
    }
    
    /*
     * Hierarchy Methods
     */
    
    /**
     * Get hierarchy info.
     * @return 
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
    public List<LevelRestPojo> getHierarchyInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("hierarchy") String hierarchyName){
        List<LevelRestPojo> levels = new RestList<LevelRestPojo>();
        for (String level : olapQueryService.getLevels(queryName, dimensionName, hierarchyName)) {
            levels.add(new LevelRestPojo(level));
        }
        return levels;
    }
//    
//    /**
//     * Update a hierarchy.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
//    public void updateHierarchy();
//    
    
//    /*
//     * Level Methods 
//     */
//    
    /**
     * Get level information.
     * @return 
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public List<MemberRestPojo> getLevelInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, 
            @PathParam("hierarchy") String hierarchyName, @PathParam("level") String levelName){
        List<MemberRestPojo> members = new RestList<MemberRestPojo>();
        for (String member : olapQueryService.getLevelMembers(queryName, dimensionName, hierarchyName, levelName)) {
            members.add(new MemberRestPojo(member));
        }
        return members;
    }
//    
//    /**
//     * Update a level.
//     */
//    @PUT
//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
//    public void updateLevel();
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
}

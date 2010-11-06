package org.saiku.rest;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

/**
 * 
 * @author tombarber
 *
 */
@Path("/{username}/query")
public interface QueryInterface {

    /*
     * Query methods
     */
    
    /**
     * Get a list of open queries.
     */
    @GET
    @Produces({"application/xml","application/json" })
    public void listQueries();
    
    /**
     * Save a query.
     */
    @PUT
    @Path("/{queryname}")
    public void saveQuery();
    
    /**
     * Delete query.
     */
    @DELETE
    @Path("/{queryname}")
    public void deleteQuery();
    
    /**
     * Create Query.
     */
    @POST
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}")
    public void createQuery();
    
    /*
     * Axis Methods.
     */
    
    /**
     * Get Axis Info.
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}")
    public void getAxisInfo();
    
    /*
     * Dimension Methods
     */
    
    /**
     * Get Dimension Info.
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}")
    public void getDimensionInfo();
    
    /**
     * Update a dimension.
     */
    @PUT
    @Path("/{queryname}/{axis}/{dimension}")
    public void updateDimension();
    
    /**
     * Move a dimension.
     */
    @POST
    @Path("/{queryname}/{axis}/{dimension}")
    public void moveDimension();
    
    /**
     * Delete a dimension.
     */
    @DELETE
    @Path("/{queryname}/{axis}/{dimension}")
    public void deleteDimension();
    
    /*
     * Hierarchy Methods
     */
    
    /**
     * Get hierarchy info.
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
    public void getHierarchyInfo();
    
    /**
     * Update a hierarchy.
     */
    @PUT
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
    public void updateHierarchy();
    
    /**
     * Move a hierarchy.
     */
    @POST
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}")
    public void moveHierarchy();
    
    /**
     * Delete a hierarchy.
     */
    @DELETE
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public void deleteHierarchy();
    
    /*
     * Level Methods 
     */
    
    /**
     * Get level information.
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public void getLevelInfo();
    
    /**
     * Update a level.
     */
    @PUT
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public void updateLevel();
    
    /**
     * Move a level.
     */
    @POST
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public void moveLevel();
    
    /**
     * Delete a level.
     */
    @DELETE
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}")
    public void deleteLevel();
    
    /*
     * Member Methods
     */
    
    /**
     * Get member information.
     */
    @GET
    @Produces({"application/xml","application/json" })
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
    public void getMemberInfo();
    
    /**
     * Update member.
     */
    @PUT
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
    public void updateMember();
    
    /**
     * Move a member.
     */
    @POST
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
    public void moveMember();
    
    /**
     * Delete a member.
     */
    @DELETE
    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
    public void deleteMember();
    
}

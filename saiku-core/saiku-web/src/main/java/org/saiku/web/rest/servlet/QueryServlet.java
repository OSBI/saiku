package org.saiku.web.rest.servlet;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.web.rest.objects.AxisRestPojo;
import org.saiku.web.rest.objects.CubeRestPojo;
import org.saiku.web.rest.objects.DimensionRestPojo;
import org.saiku.web.rest.objects.HierarchyRestPojo;
import org.saiku.web.rest.objects.LevelRestPojo;
import org.saiku.web.rest.objects.MemberRestPojo;
import org.saiku.web.rest.objects.QueryRestPojo;
import org.saiku.web.rest.objects.resultset.Cell;
import org.saiku.web.rest.util.RestList;
import org.saiku.web.rest.util.RestUtil;
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

	
/*	public void setOlapQueryService(OlapQueryService olapQueryService) {
		this.olapQueryService = olapQueryService;
	}*/

	@Autowired
	public void setOlapQueryService(OlapQueryService olapqs) {
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
	public List<QueryRestPojo> getQueries() {
		RestList<QueryRestPojo> queryList = new RestList<QueryRestPojo>();
		for (String queryName : olapQueryService.getQueries()) {
			queryList.add(new QueryRestPojo(queryName));
		}
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
	 * @return 
	 * 
	 * @return a query model.
	 * 
	 * @see 
	 */
	@POST
	@Produces({"application/xml","application/json" })
	@Path("/{queryname}")
	public QueryRestPojo createQuery(@FormParam("connection") String connectionName, @FormParam("cube") String cubeName,
			@FormParam("catalog") String catalogName, @FormParam("schema") String schemaName, @PathParam("queryname") String queryName)
	throws ServletException {
		CubeRestPojo cube = new CubeRestPojo(connectionName, cubeName, catalogName, schemaName);
		olapQueryService.createNewOlapQuery(queryName, cube.toNativeObject());
		QueryRestPojo qrp = new QueryRestPojo(queryName);
		AxisRestPojo axis = new AxisRestPojo("UNUSED",getAxisInfo(queryName, "UNUSED"));

		List<AxisRestPojo> axes = new ArrayList<AxisRestPojo>();
		axes.add(axis);
		qrp.setAxes(axes);
		return qrp;
	}

	@GET
	@Path("/{queryname}/mdx")
	public String getMDXQuery(@PathParam("queryname") String queryName){
		return olapQueryService.getMDXQuery(queryName);

	}

	@GET
	@Path("/{queryname}/result")
	public RestList<Cell[]> execute(@PathParam("queryname") String queryName){
		CellDataSet cs = olapQueryService.execute(queryName);
		return RestUtil.convert(cs);

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
	@Path("/{queryname}/axis/{axis}")
	public RestList<DimensionRestPojo> getAxisInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName){
		return RestUtil.convertDimensions(olapQueryService.getDimensions(queryName, axisName));
	}

	/**
	 * Remove all dimensions and selections on an axis
	 * @param queryName the name of the query.
	 * @param axisName the name of the axis.
	 */
	@DELETE
	@Produces({"application/xml","application/json" })
	@Path("/{queryname}/axis/{axis}")
	public void deleteAxis(@PathParam("queryname") String queryName, @PathParam("axis") String axisName){
		olapQueryService.clearAxis(queryName, axisName);
	}

	@PUT
	@Produces({"application/xml","application/json" })
	@Path("/{queryname}/axis/{axis}/nonempty/{boolean}")
	public void setNonEmpty(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("boolean") Boolean bool){
		olapQueryService.setNonEmpty(queryName, axisName, bool);
	}

	/**
	 * Sorts axis, in relation to the measures dimension. Valid sort values are ASC, DESC, BASC, DESC and CLEAR.
	 * 
	 * @param queryName
	 * @param axisName
	 * @param sortOrder
	 */
	@PUT
	@Produces({"application/xml","application/json" })
	@Path("/{queryname}/axis/{axis}/sort/{sortorder}")
	public void setSort(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("sortorder") String sortOrder){
		olapQueryService.sortAxis(queryName, axisName, sortOrder);
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
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}")
	public List<HierarchyRestPojo> getDimensionInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
		return RestUtil.convertHierarchies(olapQueryService.getHierarchies(queryName, dimensionName));
	}

	/**
	 * Update a dimension.
	 * @return 
	 */
	@PUT
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/pullup")
	public Status pullUpDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @FormParam("position") int position){
		try{
			olapQueryService.pullup(queryName, axisName, dimensionName, position);
			return Status.OK;
		}catch(Exception e){
			return Status.INTERNAL_SERVER_ERROR;
		}


	}

	/**
	 * Update a dimension.
	 * @return 
	 */
	@PUT
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/pushdown")
	public Status pushDownDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @FormParam("position") int position){
		try{
			olapQueryService.pushdown(queryName, axisName, dimensionName, position);
			return Status.OK;
		}catch(Exception e){
			return Status.INTERNAL_SERVER_ERROR;
		}


	}

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
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}")
	public Status moveDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @FormParam("position") @DefaultValue("-1")int position){
		try{
			olapQueryService.moveDimension(queryName, axisName, dimensionName, position);
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
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}")
	public Status deleteDimension(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName){
		try{
			olapQueryService.removeDimension(queryName, axisName, dimensionName);
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
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/hierarchy/{hierarchy}")
	public List<LevelRestPojo> getHierarchyInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("hierarchy") String hierarchyName){

		List<SaikuLevel> saikuLevels =  olapQueryService.getLevels(queryName, dimensionName, hierarchyName);
		List<LevelRestPojo> levels = RestUtil.convertLevels(saikuLevels);
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
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/hierarchy/{hierarchy}/{level}")
	public List<MemberRestPojo> getLevelInfo(@PathParam("queryname") String queryName, @PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, 
			@PathParam("hierarchy") String hierarchyName, @PathParam("level") String levelName){

		List<SaikuMember> saikuMembers = olapQueryService.getLevelMembers(queryName, dimensionName, hierarchyName, levelName);
		List<MemberRestPojo> members = RestUtil.convertMembers(saikuMembers);
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
	/**
	 * Move a member.
	 * @return 
	 */
	@POST
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/member/{member}")
	public Status includeMember(@FormParam("selection") @DefaultValue("MEMBER") String selectionType, @PathParam("queryname") String queryName,@PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("member") String uniqueMemberName, @FormParam("position") @DefaultValue("-1") int position, @FormParam("memberposition") @DefaultValue("-1") int memberposition){
		try{
			olapQueryService.moveDimension(queryName, axisName, dimensionName, position);

			boolean ret = olapQueryService.includeMember(queryName, dimensionName, uniqueMemberName, selectionType, memberposition);
			if(ret == true){
				return Status.CREATED;
			}
			else{
				return Status.INTERNAL_SERVER_ERROR;
			}
		} catch (Exception e){
			return Status.INTERNAL_SERVER_ERROR;
		}
	}

	@DELETE
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/member/{member}")
	public Status removeMember(@FormParam("selection") @DefaultValue("MEMBER") String selectionType, @PathParam("queryname") String queryName,@PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("member") String uniqueMemberName){
		try{
			boolean ret = olapQueryService.removeMember(queryName, dimensionName, uniqueMemberName, selectionType);
			if(ret == true){
				return Status.OK;
			}
			else{
				return Status.INTERNAL_SERVER_ERROR;
			}
		} catch (Exception e){
			e.printStackTrace();
			return Status.INTERNAL_SERVER_ERROR;
		}
	}

	
	@POST
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/hierarchy/{hierarchy}/{level}")
	public Status includeLevel(@PathParam("queryname") String queryName,@PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("hierarchy") String uniqueHierarchyName, @PathParam("level") String uniqueLevelName, @FormParam("position") @DefaultValue("-1") int position){
		try{
			olapQueryService.moveDimension(queryName, axisName, dimensionName, position);
			boolean ret = olapQueryService.includeLevel(queryName, dimensionName, uniqueHierarchyName, uniqueLevelName);
			if(ret == true){
				return Status.CREATED;
			}
			else{
				return Status.INTERNAL_SERVER_ERROR;
			}
		} catch (Exception e){
			return Status.INTERNAL_SERVER_ERROR;
		}
	}
	
	@DELETE
	@Path("/{queryname}/axis/{axis}/dimension/{dimension}/hierarchy/{hierarchy}/{level}")
	public Status removeLevel(@PathParam("queryname") String queryName,@PathParam("axis") String axisName, @PathParam("dimension") String dimensionName, @PathParam("hierarchy") String uniqueHierarchyName, @PathParam("level") String uniqueLevelName){
		try{
			boolean ret = olapQueryService.removeLevel(queryName, dimensionName, uniqueHierarchyName, uniqueLevelName);
			if(ret == true){
				return Status.OK;
			}
			else{
				return Status.INTERNAL_SERVER_ERROR;
			}
		} catch (Exception e){
			return Status.INTERNAL_SERVER_ERROR;
		}
	}

	//    
	//    /**
	//     * Delete a member.
	//     */
	//    @DELETE
	//    @Path("/{queryname}/{axis}/{dimension}/{hierarchy}/{level}/{member}")
	//    public void deleteMember();
	//    
}

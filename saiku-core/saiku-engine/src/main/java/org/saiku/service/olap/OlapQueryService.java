package org.saiku.service.olap;

import org.olap4j.metadata.Cube;
import org.olap4j.query.Query;
import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.olap.query.OlapQuery;

public class OlapQueryService {
	
	private OlapDiscoverService olapDiscoverService;
	
	public void setOlapDiscoverService(OlapDiscoverService os) {
		olapDiscoverService = os;
	}
	
	public OlapQuery createNewOlapQuery(String queryName, CubePojo cube) {
		try {
			Cube cub = olapDiscoverService.getCube(cube);
			if (cub != null) {
				return new OlapQuery(new Query(queryName, cub));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;

	}


}

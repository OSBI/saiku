package org.saiku.olap.query;

import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;

public class OlapQuery {

	Query query;
	
	public OlapQuery(Query query) {
		this.query = query;
	}
	
	public void pivot() {
		this.query.swapAxes();
	}
	
	public Map<Axis, QueryAxis> getAxes() {
		return this.query.getAxes();
	}
	
	public QueryAxis getAxis(Axis axis) {
		return this.query.getAxis(axis);
	}
	
}

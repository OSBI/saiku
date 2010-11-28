package org.saiku.olap.query;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.mdx.ParseTreeWriter;
import org.olap4j.metadata.Cube;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;

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
	
	public Cube getCube() {
		return this.query.getCube();
	}
	
	public QueryAxis getUnusedAxis() {
		return this.query.getUnusedAxis();
	}
	
	public void moveDimension(QueryDimension dimension, Axis axis) {
		QueryAxis oldQueryAxis = findAxis(dimension);
		QueryAxis newQueryAxis = query.getAxis(axis);
		if (oldQueryAxis != null && newQueryAxis != oldQueryAxis) {
			if (!newQueryAxis.getDimensions().contains(dimension)) {
				newQueryAxis.addDimension(dimension);	
			}
			oldQueryAxis.removeDimension(dimension);
		}
	}

	public void moveDimension(QueryDimension dimension, Axis axis, int position) {
        QueryAxis oldQueryAxis = findAxis(dimension);
        QueryAxis newQueryAxis = query.getAxis(axis);
        if (oldQueryAxis != null && newQueryAxis != oldQueryAxis) {
            if (!newQueryAxis.getDimensions().contains(dimension)) {
                newQueryAxis.addDimension(position, dimension);   
            }
            oldQueryAxis.removeDimension(dimension);
        }
    }
	
	public QueryDimension getDimension(String name) {
		return this.query.getDimension(name);
	}
	
	private QueryAxis findAxis(QueryDimension dimension) {
		if (query.getUnusedAxis().getDimensions().contains(dimension)) {
			return query.getUnusedAxis();
		}
		else {
			Map<Axis,QueryAxis> axes = query.getAxes();
			for (Axis axis : axes.keySet()) {
				if (axes.get(axis).getDimensions().contains(dimension)) {
					return axes.get(axis);
				}
			}
		
		}
		return null;
	}

    public String getMDX() {
       
        final Writer writer = new StringWriter();
        this.query.getSelect().unparse(new ParseTreeWriter(new PrintWriter(writer)));
        
        return writer.toString();
    }

	
}

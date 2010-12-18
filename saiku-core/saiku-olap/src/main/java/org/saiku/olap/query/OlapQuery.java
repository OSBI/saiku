package org.saiku.olap.query;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Date;
import java.util.Map;

import org.olap4j.Axis;
import org.olap4j.CellSet;
import org.olap4j.mdx.ParseTreeWriter;
import org.olap4j.metadata.Cube;
import org.olap4j.query.Query;
import org.olap4j.query.QueryAxis;
import org.olap4j.query.QueryDimension;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.olap.util.OlapResultSetUtil;

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
            oldQueryAxis.removeDimension(dimension);
            newQueryAxis.addDimension(dimension);   
		}
	}

	public void moveDimension(QueryDimension dimension, Axis axis, int position) {
        QueryAxis oldQueryAxis = findAxis(dimension);
        QueryAxis newQueryAxis = query.getAxis(axis);
        if (oldQueryAxis != null && newQueryAxis != oldQueryAxis) {
            oldQueryAxis.removeDimension(dimension);
            newQueryAxis.addDimension(position, dimension);   
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
    
    public CellDataSet execute() throws Exception {
        final Query mdx = this.query;
        mdx.validate();
        final Writer writer = new StringWriter();
        mdx.getSelect().unparse(new ParseTreeWriter(new PrintWriter(writer)));
        Long start = (new Date()).getTime();
        final CellSet cellSet = mdx.execute();
        Long exec = (new Date()).getTime();

        CellDataSet result = OlapResultSetUtil.cellSet2Matrix(cellSet);
        Long format = (new Date()).getTime();
        System.out.println("Size: " + result.getWidth() + "/" + result.getHeight() + "\tExecute:\t" + (exec - start)
                + "ms\tFormat:\t" + (format - exec) + "ms\t Total: " + (format - start) + "ms");
        return result;

    }
}

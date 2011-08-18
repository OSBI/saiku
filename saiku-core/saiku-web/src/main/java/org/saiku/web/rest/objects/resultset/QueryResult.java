package org.saiku.web.rest.objects.resultset;

import java.util.List;

public class QueryResult {
	
	private List<Cell[]> cellset;
	private Integer runtime;
	private String error;
	private Integer height;
	private Integer width;
	

	public QueryResult(List<Cell[]> cellset, int runtime, int width, int height) {
		this.cellset = cellset;
		this.runtime = runtime;
		this.height = height;
		this.width = width;
	}
	
	public QueryResult(String error) {
		this.error = error;
	}

	public List<Cell[]> getCellset() {
		return cellset;
	}

	public Integer getRuntime() {
		return runtime;
	}

	public String getError() {
		return error;
	}

	public Integer getHeight() {
		return height;
	}

	public Integer getWidth() {
		return width;
	}
	
	public void setRuntime(Integer runtime) {
		this.runtime = runtime;
	}

	public void setHeight(Integer height) {
		this.height = height;
	}

	public void setWidth(Integer width) {
		this.width = width;
	}



}

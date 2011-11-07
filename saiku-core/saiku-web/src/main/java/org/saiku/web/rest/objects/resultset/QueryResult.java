/*
 * Copyright (C) 2011 OSBI Ltd
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
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

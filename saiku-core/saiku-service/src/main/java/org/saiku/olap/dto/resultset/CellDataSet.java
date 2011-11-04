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
package org.saiku.olap.dto.resultset;

import java.io.Serializable;

public class CellDataSet implements Serializable {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    private int width;

    private int height;

    private AbstractBaseCell[][] cellSetHeader;

    private AbstractBaseCell[][] cellSetBody;

    private int offset;
    
    public int runtime;

    public CellDataSet() {
        super();
    }

    public CellDataSet(final int width, final int height) {
        this.width = width;
        this.height = height;
    }

    public AbstractBaseCell[][] getCellSetHeaders() {
        return cellSetHeader;
    }

    public void setCellSetHeaders(final AbstractBaseCell[][] cellSet) {
        this.cellSetHeader = cellSet;
    }

    public AbstractBaseCell[][] getCellSetBody() {
        return cellSetBody;
    }

    public void setCellSetBody(final AbstractBaseCell[][] cellSet) {
        this.cellSetBody = cellSet;
    }

    public void setOffset(final int offset) {
        this.offset = offset;
    }

    public int getOffset() {
        return offset;

    }

    /**
     * @param width
     *            the width to set
     */
    public void setWidth(final int width) {
        this.width = width;
    }

    /**
     * @return the width
     */
    public int getWidth() {
        return width;
    }

    /**
     * @param height
     *            the height to set
     */
    public void setHeight(final int height) {
        this.height = height;
    }

    /**
     * @return the height
     */
    public int getHeight() {
        return height;
    }

	public int getRuntime() {
		return runtime;
	}

	public void setRuntime(int runtime) {
		this.runtime = runtime;
	}
}

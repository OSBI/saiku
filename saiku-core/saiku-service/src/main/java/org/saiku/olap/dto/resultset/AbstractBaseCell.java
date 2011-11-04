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
import java.util.HashMap;
import java.util.Map;

public abstract class AbstractBaseCell implements Serializable {

    private static final long serialVersionUID = 1L;

    /** The formatted value. */
    private String formattedValue;

    /** The raw value. */
    private String rawValue;

    public boolean right = false;

    public boolean sameAsPrev = false;

    private String parentDimension = null;

    private HashMap<String,String> properties = new HashMap<String, String>();
    /**
     * 
     * Blank Constructor for serialization dont use.
     * 
     */
    public AbstractBaseCell() {
        super();
    }

    /**
     * 
     * BaseCell Constructor, every cell type should inherit basecell.
     * 
     * @param right
     * @param sameAsPrev
     */
    public AbstractBaseCell(final boolean right, final boolean sameAsPrev) {
        this.right = right;
        this.sameAsPrev = sameAsPrev;
    }

    /**
     * Gets the formatted value.
     * 
     * @return the formatted value
     */
    public String getFormattedValue() {
        return formattedValue;
    }

    /**
     * Gets the raw value.
     * 
     * @return the raw value
     */
    public String getRawValue() {
        return rawValue;
    }

    /**
     * Sets the formatted value.
     * 
     * @param formattedValue
     *            the new formatted value
     */
    public void setFormattedValue(final String formattedValue) {
        this.formattedValue = formattedValue;
    }

    /**
     * Sets the raw value.
     * 
     * @param rawValue
     *            the new raw value
     */
    public void setRawValue(final String rawValue) {
        this.rawValue = rawValue;
    }

    /**
     * 
     *TODO JAVADOC
     * 
     * @param set
     */
    public void setRight(final boolean set) {
        this.right = set;
    }

    /**
     * 
     * Set true if value is same as the previous one in the row.
     * 
     * @param same
     */
    public void setSameAsPrev(final boolean same) {
        this.sameAsPrev = same;
    }

    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        return formattedValue;
    }

    /**
     * 
     *TODO JAVADOC
     * 
     */
    public void setParentDimension(final String pdim) {
        parentDimension = pdim;
    }

    public String getParentDimension() {
        return parentDimension;
    }

    public void setProperty(String name, String value){
        properties.put(name, value);
    }
    
    public Map<String, String> getProperties(){
        return properties;
    }
    
    public String getProperty(String name){
        return properties.get(name);
    }
}

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
import java.util.List;


/**
 * The Class CellInfo.
 * 
 * @author wseyler
 */
public class DataCell extends AbstractBaseCell implements Serializable {

    private static final long serialVersionUID = 1L;

    /** The color value. */
    private String colorValue = null; // Color held as hex String

    private Double rawNumber = null;

    private MemberCell parentColMember = null;

    private MemberCell parentRowMember = null;

    private List<Integer> coordinates = null;
    //private HashMap<String,String> properties = new HashMap<String, String>();
    
    
    /**
     * 
     * Blank constructor for serialization purposes, don't use it.
     * 
     */
    public DataCell() {
        super();
    }

    /**
     * 
     * Construct a Data Cell containing olap data.
     * 
     * @param b
     * @param c
     */
    public DataCell(final boolean right, final boolean sameAsPrev, List<Integer> coordinates) {
        super();
        this.right = right;
        this.sameAsPrev = sameAsPrev;
        this.coordinates = coordinates;
    }
    
    public MemberCell getParentColMember() {
        return parentColMember;
    }

    public void setParentColMember(final MemberCell parentColMember) {
        this.parentColMember = parentColMember;
    }
//
//    public MemberCell getParentRowMember() {
//        return parentRowMember;
//    }

//    public void setParentRowMember(final MemberCell parentRowMember) {
//        this.parentRowMember = parentRowMember;
//    }


    public Number getRawNumber() {
        return rawNumber;
    }

    public void setRawNumber(final Double rawNumber) {
        this.rawNumber = rawNumber;
    }



    /**
     * Gets the color value.
     * 
     * @return the color value
     */
    public String getColorValue() {
        return colorValue;
    }

    /**
     * Sets the color value.
     * 
     * @param colorValue
     *            the new color value
     */
    public void setColorValue(final String colorValue) {
        this.colorValue = colorValue;
    }

    public List<Integer> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<Integer> coordinates) {
        this.coordinates = coordinates;
    }
    
/*    public void setProperty(String name, String value){
        properties.put(name, value);
    }
    
    public HashMap<String, String> getProperties(){
        return properties;
    }
    
    public String getProperty(String name){
        return properties.get(name);
    }
  */  
}

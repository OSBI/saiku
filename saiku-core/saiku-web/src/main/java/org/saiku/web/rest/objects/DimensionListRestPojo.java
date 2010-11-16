package org.saiku.web.rest.objects;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="dimensions")
public class DimensionListRestPojo {

	  public static class DimensionRestPojo {
	        public DimensionRestPojo(){
	        	throw new RuntimeException("Unsupported Constructor. Serialization only");
	        }
	        
	        public DimensionRestPojo(String dimensionName) {
	            this.dimensionName = dimensionName;
	          
	        }

	        /**
	         * A Axis Name.
	         */
	        @XmlAttribute(name = "dimension", required = false)
	        private String dimensionName;

			public String toNativeObject() {
				return new String(dimensionName);
			}
	    }
	  
	    @XmlElement(name = "datasource")
	    private List<DimensionRestPojo> dimensionList = new ArrayList<DimensionRestPojo>();

	    public DimensionListRestPojo() {
	    }

	    public DimensionListRestPojo(List<String> axes) {
	    	for (String axis : axes) {
	    		dimensionList.add(new DimensionRestPojo(axis));
	    	}
	    }
	    public void addCube(DimensionRestPojo cubePojo) {
	        dimensionList.add(cubePojo);
	    }

	    public void setCubeList(List<DimensionRestPojo> axesList) {
	        this.dimensionList = axesList;
	    }

	    public List<DimensionRestPojo> getCubeList() {
	        return dimensionList;
	    }

}

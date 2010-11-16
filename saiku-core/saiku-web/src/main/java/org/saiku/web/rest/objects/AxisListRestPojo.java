package org.saiku.web.rest.objects;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="axes")
public class AxisListRestPojo {

	  public static class AxisRestPojo {
	        public AxisRestPojo(){
	        	throw new RuntimeException("Unsupported Constructor. Serialization only");
	        }
	        
	        public AxisRestPojo(String axisName) {
	            this.axisName = axisName;
	          
	        }

	        /**
	         * A Axis Name.
	         */
	        @XmlAttribute(name = "axisname", required = false)
	        private String axisName;

			public String toNativeObject() {
				return new String(axisName);
			}
	    }
	  
	    @XmlElement(name = "axis")
	    private List<AxisRestPojo> axisList = new ArrayList<AxisRestPojo>();

	    public AxisListRestPojo() {
	    }

	    public AxisListRestPojo(List<String> axes) {
	    	for (String axis : axes) {
	    		axisList.add(new AxisRestPojo(axis));
	    	}
	    }
	    public void addCube(AxisRestPojo cubePojo) {
	        axisList.add(cubePojo);
	    }

	    public void setCubeList(List<AxisRestPojo> axesList) {
	        this.axisList = axesList;
	    }

	    public List<AxisRestPojo> getCubeList() {
	        return axisList;
	    }

}

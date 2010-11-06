package org.saiku.rest.impl;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;

import org.saiku.olap.discover.pojo.CubePojo;
import org.saiku.rest.DataSourceInterface;
import org.saiku.rest.objects.CubeRestPojo;
import org.saiku.service.olap.OlapDiscoverService;


/**
 * 
 * @author tombarber
 *
 */
@SuppressWarnings("restriction")
public class DataSourceInterfaceImpl implements DataSourceInterface {
    
    @XmlElement(name = "datasources", required = true)
    List<CubeRestPojo> cubeList = new ArrayList<CubeRestPojo>();
    
    OlapDiscoverService olapDiscoverService;
    
    public void setOlapDiscoverService(OlapDiscoverService olapds) {
    	olapDiscoverService = olapds;
    }
    
    public List<CubeRestPojo> getCubes() {
        
        for(CubePojo cube : olapDiscoverService.getAllCubes()){
            cubeList.add(new CubeRestPojo(cube));
        }
        
        return cubeList;
        
    }

}

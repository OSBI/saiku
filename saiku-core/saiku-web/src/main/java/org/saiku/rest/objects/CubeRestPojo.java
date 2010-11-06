package org.saiku.rest.objects;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.discover.pojo.CubePojo;

@SuppressWarnings("restriction")
@XmlRootElement(name="datasources")
public class CubeRestPojo{
	
    @XmlAttribute(name = "connectionname", required = false)
    private String connectionName;
    
    @XmlAttribute(name = "cubename", required = false)
    private String cubeName;
    
    @XmlAttribute(name = "catalogname", required = false)
    private String catalog;
    
    @XmlAttribute(name = "schemaname", required = false)
    private String schema;
   
    
   public CubeRestPojo(CubePojo cubePojo) {
       
        connectionName = cubePojo.getConnectionName();
        catalog = cubePojo.getCatalog();
        schema = cubePojo.getSchema();
        cubeName = cubePojo.getCubeName();
    }

    
    

}

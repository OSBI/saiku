package org.saiku.olap.discover.pojo;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


/**
 * A Cube Pojo for the rest interface.
 * @author tombarber
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="datasources")
public class CubesListRestPojo {

    /**
     * To String.
     */
    @Override
    public String toString() {
        return "CubeRestPojo [cubeList=" + cubeList + "]";
    }

    /**
     * Cubes Available To The Current User.
     * @author tombarber, pstoellberger
     *
     */
    public static class CubeRestPojo implements ICubePojo {
        public CubeRestPojo(){
        	throw new RuntimeException("Unsupported Constructor. Serialization only");
        }
        public CubeRestPojo(String _connectionName, String _cubeName, String _catalog, String _schema) {
            this.connectionName = _connectionName;
            this.cubeName = _cubeName;
            this.catalog = _catalog;
            this.schema = _schema;
        }

        /**
         * A Connection Name.
         */
        @XmlAttribute(name = "connection", required = false)
        private String connectionName;

        /**
         * A Cube Name.
         */
        @XmlAttribute(name = "cube", required = false)
        private String cubeName;

        /**
         * A Catalog.
         */
        @XmlAttribute(name = "catalog", required = false)
        private String catalog;

        /**
         * A Schema Name.
         */
		@XmlAttribute(name = "schema", required = false)
        private String schema;

		public String getCatalog() {
			return catalog;
		}
		public String getConnectionName() {
			return connectionName;
		}
		public String getCubeName() {
			return cubeName;
		}
		public String getSchema() {
			return schema;
		}
    }
    
    @XmlElement(name = "datasource")
    private List<CubeRestPojo> cubeList = new ArrayList<CubeRestPojo>();

    public CubesListRestPojo() {
    }

    public void addCube(CubeRestPojo cubePojo) {
        cubeList.add(cubePojo);
    }

    public void setCubeList(List<CubeRestPojo> cubeList) {
        this.cubeList = cubeList;
    }

    public List<CubeRestPojo> getCubeList() {
        return cubeList;
    }

}

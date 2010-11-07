package org.saiku.web.rest.objects;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.discover.pojo.CubePojo;

/**
 * A Cube Pojo for the rest interface.
 * @author tombarber
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@SuppressWarnings("restriction")
@XmlRootElement(name="datasources")
public class CubeRestPojo {

    /**
     * To String.
     */
    @Override
    public String toString() {
        return "CubeRestPojo [cubeList=" + cubeList + "]";
    }

    /**
     * Cubes Available To The Current User.
     * @author tombarber
     *
     */
    public static class Cube {
        public Cube(){}
        public Cube(String _connectionName, String _cubeName, String _catalog, String _schema) {
            this.connectionName = _connectionName;
            this.cubeName = _cubeName;
            this.catalog = _catalog;
            this.schema = _schema;
        }

        /**
         * A Connection Name.
         */
        @XmlAttribute(name = "connectionname", required = false)
        private String connectionName;

        /**
         * A Cube Name.
         */
        @XmlAttribute(name = "cubename", required = false)
        private String cubeName;

        /**
         * A Catalog.
         */
        @XmlAttribute(name = "catalogname", required = false)
        private String catalog;

        /**
         * A Schema Name.
         */
        @XmlAttribute(name = "schemaname", required = false)
        private String schema;
    }
    
    @XmlElement(name = "datasource")
    private List<Cube> cubeList = new ArrayList<Cube>();

    public CubeRestPojo() {
    }

    public void addCubeRestPojo(CubePojo cubePojo) {

        Cube cube = new Cube(cubePojo.getConnectionName(), cubePojo.getCubeName(), cubePojo.getCatalog(), cubePojo.getSchema());
        cubeList.add(cube);

    }

    public void setCubeList(List<Cube> cubeList) {
        this.cubeList = cubeList;
    }

    public List<Cube> getCubeList() {
        return cubeList;
    }

}

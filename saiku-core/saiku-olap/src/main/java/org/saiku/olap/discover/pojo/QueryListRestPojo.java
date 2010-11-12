package org.saiku.olap.discover.pojo;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


/**
 * A Query Pojo for the rest interface.
 * @author pstoellberger
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name="queries")
public class QueryListRestPojo {

    /**
     * To String.
     */
    @Override
    public String toString() {
        return "QueryListRestPojo [queryList=" + queryList + "]";
    }

    /**
     * Cubes Available To The Current User.
     * @author tombarber, pstoellberger
     *
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlRootElement(name="query")
    public static class QueryRestPojo {
    	
        public QueryRestPojo() {
        	throw new RuntimeException("Unsupported Constructor. Serialization only");
        }
        
        public QueryRestPojo(String name) {
            // this.cube = cube;
            this.queryName = name;
        }

        /**
         * A Connection Name.
         */
//        @XmlAttribute(name = "cube", required = false)
//        private CubeRestPojo cube;

        /**
         * A Cube Name.
         */
        @XmlAttribute(name = "name", required = false)
        private String queryName;

		public String getName() {
			return queryName;
		}

//		public CubeRestPojo getCube() {
//			return cube;
//		}
    }
    
    @XmlElement(name = "querylist")
    private List<QueryRestPojo> queryList = new ArrayList<QueryRestPojo>();

    public QueryListRestPojo() {
    }

    public void addQuery(QueryRestPojo query) {
    	queryList.add(query);
    }

    public void setQueryList(List<QueryRestPojo> queryList) {
        this.queryList = queryList;
    }

    public List<QueryRestPojo> getQueryList() {
        return queryList;
    }

    
}
package org.saiku.web.rest.objects;

import org.saiku.datasources.datasource.SaikuDatasource;

import java.util.Properties;
import java.util.UUID;

/**
 * Map from SaikuDatasources to JSON variants.
 */
public class DataSourceMapper {

    String connectionname;
    String jdbcurl;
    String schema;
    String driver;
    String username;
    String password;
    String connectiontype;
    String id;
    String path;

    public DataSourceMapper() {

    }

    public DataSourceMapper(SaikuDatasource ds) {
        String location = ds.getProperties().getProperty("location");

        String[] loc = location.split(";");

        String[] url = loc[0].split("=");
        if (ds.getProperties().getProperty("driver").equals("mondrian.olap4j.MondrianOlap4jDriver")) {
            String[] cat = loc[1].split("=");
            String[] drv = loc[2].split("=");
            this.schema = cat[1];
            this.driver = drv[1];
            this.connectiontype = "MONDRIAN";
        } else {
            this.connectiontype = "XMLA";
        }
        this.connectionname = ds.getName();
        this.jdbcurl = url[1];
        this.username = ds.getProperties().getProperty("username");
        this.password = ds.getProperties().getProperty("password");
        this.path = ds.getProperties().getProperty("path");
        this.id = ds.getProperties().getProperty("id");


    }

    public SaikuDatasource toSaikuDataSource() {
        Properties props = new Properties();
        String location;
        if (connectiontype.equals("MONDRIAN")) {
            props.setProperty("driver", "mondrian.olap4j.MondrianOlap4jDriver");
            location = "jdbc:mondrian:Jdbc=" + jdbcurl + ";Catalog=mondrian://" + schema + ";JdbcDrivers=" + driver;
        } else {
            props.setProperty("driver", "org.olap4j.driver.xmla.XmlaOlap4jDriver");
            location = "jdbc:xmla:Server=" + jdbcurl;
        }


        props.setProperty("location", location);
        props.setProperty("username", this.username);
        props.setProperty("password", this.password);
        if(this.path!=null) {
            props.setProperty("path", this.path);
        }
        if (this.id != null) {
            props.setProperty("id", this.id);
        } else {
            props.setProperty("id", UUID.randomUUID().toString());
        }
        return new SaikuDatasource(this.getConnectionname(), SaikuDatasource.Type.OLAP, props);

    }

    public String getConnectionname() {
        return connectionname;
    }

    public void setConnectionname(String connectionname) {
        this.connectionname = connectionname;
    }

    public String getJdbcurl() {
        return jdbcurl;
    }

    public void setJdbcurl(String jdbcurl) {
        this.jdbcurl = jdbcurl;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getDriver() {
        return driver;
    }

    public void setDriver(String driver) {
        this.driver = driver;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConnectiontype() {
        return connectiontype;
    }

    public void setConnectiontype(String connectiontype) {
        this.connectiontype = connectiontype;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}

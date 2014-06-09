package org.saiku.repository;

import org.saiku.datasources.datasource.SaikuDatasource;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * Created by bugg on 04/06/14.
 */

@XmlRootElement
public class DataSource {

    String type;
    String name;
    String driver;
    String location;
    String username;
    String password;

    public DataSource(SaikuDatasource datasource) {
        this.type = datasource.getType().toString();
        this.name = datasource.getName();
        this.driver = datasource.getProperties().getProperty("driver");
        this.location = datasource.getProperties().getProperty("location");
        this.username = datasource.getProperties().getProperty("username");
        this.password = datasource.getProperties().getProperty("password");

    }

    public DataSource(){

    }
    public String getPassword() {
        return password;
    }

    @XmlElement
    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    @XmlElement
    public void setUsername(String username) {
        this.username = username;
    }

    public String getLocation() {
        return location;
    }

    @XmlElement
    public void setLocation(String location) {
        this.location = location;
    }

    public String getDriver() {
        return driver;
    }

    @XmlElement
    public void setDriver(String driver) {
        this.driver = driver;
    }

    public String getName() {
        return name;
    }

    @XmlElement
    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    @XmlElement
    public void setType(String type) {
        this.type = type;
    }


}

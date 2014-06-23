package org.saiku.database.dto;

/**
 * Created by bugg on 13/06/14.
 */
public class MondrianSchema {

    String name;
    String path;

    public MondrianSchema() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}

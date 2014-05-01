package org.saiku.service.util.dto;

/**
 * Created by bugg on 30/04/14.
 */
public class Plugin {

  private String name;
  private String description;
  private String path;

  public Plugin( String name, String description, String path ) {
    this.name = name;
    this.description = description;
    this.path = path;
  }

  public String getName() {
    return name;
  }

  public void setName( String name ) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription( String description ) {
    this.description = description;
  }

  public String getPath() {
    return path;
  }

  public void setPath( String path ) {
    this.path = path;
  }
}

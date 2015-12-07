package org.saiku.olap.query2;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by bugg on 15/09/15.
 */
public class ThinCalculatedMember {

  private String parentMember;
  private String dimension;
  private String name;
  private String uniqueName;
  private String caption;
  private Map<String, String> properties = new HashMap<>();
  private String formula;
  private String hierarchyName;

  public ThinCalculatedMember() {}

  public ThinCalculatedMember(String dimension, String hierarchyName, String name, String uniqueName, String caption,
                              String formula, Map<String, String> properties, String parentMember) {
    this(dimension, hierarchyName, name, uniqueName, caption, formula, properties);
    this.parentMember = parentMember;
  }

  public ThinCalculatedMember(String dimension, String hierarchyName, String name, String uniqueName, String caption,
                              String formula, Map<String, String> properties) {
    this.dimension = dimension;
    this.hierarchyName = hierarchyName;
    this.uniqueName = uniqueName;
    this.formula = formula;
    this.name = name;
    this.caption = caption;
    this.properties = properties;
  }

  public String getDimension() {
    return dimension;
  }


  /**
   * @return the uniqueName
   */
  public String getUniqueName() {
    return uniqueName;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @return the caption
   */
  public String getCaption() {
    return caption;
  }

  /**
   * @return the properties
   */
  public Map<String, String> getProperties() {
    return properties;
  }

  /**
   * @return the formula
   */
  public String getFormula() {
    return formula;
  }

  /**
   * @return the hierarchyUniqueName
   */
  public String getHierarchyName() {
    return hierarchyName;
  }

  /**
   *
   * @return the parent member.
   */
  public String getParentMember() {
    return parentMember;
  }
}
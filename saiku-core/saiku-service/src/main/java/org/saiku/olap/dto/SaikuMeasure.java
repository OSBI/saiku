package org.saiku.olap.dto;

public class SaikuMeasure extends SaikuMember {

  private String measureGroup;
  private Boolean calculated;

  public SaikuMeasure() {
  }

  public SaikuMeasure(
    String name,
    String uniqueName,
    String caption,
    String description,
    String dimensionUniqueName,
    String hierarchyUniqueName,
    String levelUniqueName,
    boolean visible,
    boolean calculated,
    String measuregroup) {
    super( name, uniqueName, caption, description, dimensionUniqueName, hierarchyUniqueName, levelUniqueName );
    this.calculated = calculated;
    this.measureGroup = measuregroup;
  }

  /**
   * @return the calculated
   */
  public Boolean isCalculated() {
    return calculated;
  }

  /**
   *
   * @return the measuregroup
   */
  public String getMeasureGroup() {
    return measureGroup;
  }

}

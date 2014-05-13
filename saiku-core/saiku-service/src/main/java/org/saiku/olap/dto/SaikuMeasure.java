package org.saiku.olap.dto;

public class SaikuMeasure extends SaikuMember {

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
    boolean calculated ) {
    super( name, uniqueName, caption, description, dimensionUniqueName, hierarchyUniqueName, levelUniqueName );
    this.calculated = calculated;
  }

  /**
   * @return the calculated
   */
  public Boolean isCalculated() {
    return calculated;
  }


}

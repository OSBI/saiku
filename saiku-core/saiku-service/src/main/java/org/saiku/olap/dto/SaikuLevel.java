/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.saiku.olap.dto;

import org.olap4j.metadata.Level;

import java.util.HashMap;
import java.util.Map;

import mondrian.olap.Annotation;

/**
 * SaikuLevel.
 */
public class SaikuLevel extends AbstractSaikuObject {

  private final Map<String, Annotation> annotations;
  private final String levelType;
  private String caption;
  private String hierarchyUniqueName;
  private String dimensionUniqueName;
  //private transient List<SaikuMember> members;
  private boolean visible;
  private String description;

  public SaikuLevel(String name, String uniqueName, String caption, String description, String s, String uniqueName1,
                    boolean visible) {
    super(null, null);
    throw new RuntimeException("Unsupported Constructor. Serialization only");
  }


  public SaikuLevel(
      String name,
      String uniqueName,
      String caption,
      String description,
      String dimensionUniqueName,
      String hierarchyUniqueName,
      boolean visible,
      Level.Type levelType, Map<String, Annotation> annotations) {
    super(uniqueName, name);
    this.caption = caption;
    this.hierarchyUniqueName = hierarchyUniqueName;
    this.dimensionUniqueName = dimensionUniqueName;
    this.visible = visible;
    this.description = description;
    this.annotations = annotations;
    this.levelType = levelType.name();
    //this.members = members;
  }

  public String getCaption() {
    return caption;
  }

  public String getHierarchyUniqueName() {
    return hierarchyUniqueName;
  }

  public String getDimensionUniqueName() {
    return dimensionUniqueName;
  }

  public boolean isVisible() {
    return visible;
  }

  public String getDescription() {
    return description;
  }

  public Map<String, String> getAnnotations() {

    Map<String, String> m = new HashMap<String, String>();
    for (Map.Entry<String, Annotation> entry : annotations.entrySet()) {
      m.put(entry.getKey(), (String) entry.getValue().getValue());
    }


    return m;
  }

  public String getLevelType() {
    return levelType;
  }
  //public List<SaikuMember> getMembers() {
  //return members;
  //}
}

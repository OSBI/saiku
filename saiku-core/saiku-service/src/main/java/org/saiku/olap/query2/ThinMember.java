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
package org.saiku.olap.query2;

/**
 * ThinMember.
 */
public class ThinMember {

  private String name;
  private String uniqueName;
  private String caption;

  public ThinMember() {
  }

  public ThinMember(String name, String uniqueName, String caption) {
    this.name = name;
    this.uniqueName = uniqueName;
    this.caption = caption;
  }

  /**
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name to set
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the uniqueName
   */
  public String getUniqueName() {
    return uniqueName;
  }

  /**
   * @param uniqueName the uniqueName to set
   */
  public void setUniqueName(String uniqueName) {
    this.uniqueName = uniqueName;
  }

  /**
   * @return the caption
   */
  public String getCaption() {
    return caption;
  }

  /**
   * @param caption the caption to set
   */
  public void setCaption(String caption) {
    this.caption = caption;
  }


}

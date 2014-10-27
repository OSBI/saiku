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

import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;

/**
 * ThinSelection
 */
public class ThinSelection {

  /**
   * Selection Type.
   */
  public enum Type {
    INCLUSION,
    EXCLUSION,
    RANGE
  }

  private Type type = Type.INCLUSION;
  private List<ThinMember> members = new ArrayList<ThinMember>();
  @Nullable
  private String parameter = null;

  public ThinSelection() {
  }

  public ThinSelection(Type type, @Nullable List<ThinMember> members) {
    this.type = type;
    if (members != null) {
      this.members.addAll(members);
    }
    this.parameter = null;
  }

  /**
   * @return the type
   */
  public Type getType() {
    return type;
  }

  /**
   * @param type the type to set
   */
  public void setType(Type type) {
    this.type = type;
  }

  /**
   * @return the members
   */
  public List<ThinMember> getMembers() {
    return members;
  }

  /**
   * @param members the members to set
   */
  public void setMembers(List<ThinMember> members) {
    this.members = members;
  }

  @Nullable
  public String getParameterName() {
    return parameter;
  }

  public void setParameterName(String name) {
    this.parameter = name;

  }
}

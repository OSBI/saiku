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

package org.saiku.repository;

import java.util.List;


/**
 * RepositoryFileObject.
 */
public class RepositoryFileObject implements IRepositoryObject {

  private final Type type;
  private final String name;
  private final String id;
  private final String filetype;
  private final String path;
  private final List<AclMethod> acl;

  public RepositoryFileObject(String filename, String id, String filetype, String path, List<AclMethod> acl) {
    this.type = Type.FILE;
    this.name = filename;
    this.id = id;
    this.filetype = filetype;
    this.path = path;
    this.acl = acl;

  }

  public Type getType() {
    return type;
  }

  public String getName() {
    return name;
  }

  public String getFileType() {
    return filetype;
  }

  public String getPath() {
    return path;
  }

  public String getId() {
    return id;
  }

  public List<AclMethod> getAcl() {
    return acl;
  }
}

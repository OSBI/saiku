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

package org.saiku.web.rest.resources;


import org.saiku.repository.IRepositoryObject;

import java.util.List;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;

/**
 * ISaikuRepository.
 */
public interface ISaikuRepository {

  /**
   * Get Saved Queries.
   *
   * @return A list of SavedQuery Objects.
   */
  @GET
  @Produces({ "application/json" })
  List<IRepositoryObject> getRepository(
      @QueryParam("path") String path, @QueryParam("type") String type);

  /**
   * Load a resource.
   *
   * @param file - The name of the repository file to load.
   * @return A Repository File Object.
   */
  @GET
  @Produces({ "text/plain" })
  @Path("/resource")
  Response getResource(@QueryParam("file") String file);

  /**
   * Save a resource.
   *
   * @param file    - The name of the repository file to load.
   * @param content - The content to save.
   * @return Status
   */
  @POST
  @Path("/resource")
  Response saveResource(@FormParam("file") String file,
                        @FormParam("content") String content);

  /**
   * Delete a resource.
   *
   * @param file - The name of the repository file to load.
   * @return Status
   */
  @DELETE
  @Path("/resource")
  Response deleteResource(@QueryParam("file") String file);

}

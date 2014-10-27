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

import org.saiku.service.datasource.RepositoryDatasourceManager;

import org.apache.jackrabbit.webdav.DavException;
import org.apache.jackrabbit.webdav.DavResource;
import org.apache.jackrabbit.webdav.WebdavRequest;
import org.apache.jackrabbit.webdav.WebdavResponse;
import org.apache.jackrabbit.webdav.simple.SimpleWebdavServlet;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.io.IOException;

import javax.jcr.Repository;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;

/**
 * SaikuWebdavServlet.
 */
public final class SaikuWebdavServlet extends SimpleWebdavServlet {


  private RepositoryDatasourceManager bean;

  @Override
  public void init(ServletConfig config) throws ServletException {
    super.init(config);
    ServletContext context = getServletContext();
    WebApplicationContext applicationContext =
        WebApplicationContextUtils
            .getWebApplicationContext(context);
    bean = (RepositoryDatasourceManager) applicationContext.getBean("repositoryDsManager");
  }

  @NotNull
  @Override
  public Repository getRepository() {

    return (Repository) bean.getRepository();
  }


  @Override
  public void doPost(WebdavRequest request,
                     WebdavResponse response,
                     DavResource resource)
      throws IOException,
      DavException {
    super.doPost(request, response, resource);
  }

  @Override
  public void doPut(WebdavRequest request,
                    WebdavResponse response,
                    DavResource resource)
      throws IOException,
      DavException {
    super.doPut(request, response, resource);
  }
}

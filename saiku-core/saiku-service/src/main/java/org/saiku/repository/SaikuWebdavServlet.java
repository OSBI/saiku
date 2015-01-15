package org.saiku.repository;

import org.saiku.service.datasource.RepositoryDatasourceManager;

import org.apache.jackrabbit.webdav.*;
import org.apache.jackrabbit.webdav.simple.SimpleWebdavServlet;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.io.IOException;

import javax.jcr.Repository;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;

/**
 * Created by bugg on 04/09/14.
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

    @Override
    public Repository getRepository() {

        return (Repository) bean.getRepository();
    }


    @Override
    public void doPost(WebdavRequest request,
                       WebdavResponse response,
                       DavResource resource)
            throws IOException,
            DavException{

//        super.doPost(request, response, resource);
      DavResource parentResource = resource.getCollection();
      if (parentResource == null || !parentResource.exists()) {
        // parent does not exist
        response.sendError(DavServletResponse.SC_CONFLICT);
        return;
      }

      int status;
      // test if resource already exists
      if (resource.exists()) {
        status = DavServletResponse.SC_NO_CONTENT;
      } else {
        status = DavServletResponse.SC_CREATED;
      }

      parentResource.addMember(resource, getInputContext(request, request.getInputStream()));
      response.setStatus(status);

    }

    @Override
    public void doPut(WebdavRequest request,
                       WebdavResponse response,
                       DavResource resource)
            throws IOException,
            DavException{
        super.doPut(request, response, resource);
    }
}

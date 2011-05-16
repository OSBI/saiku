/*
 * The MIT License
 * 
 * Copyright (c) 2011, Aaron Phillips
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package org.saiku.plugin;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.enunciate.modules.jersey.EnunciateJerseyServletContainer;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;

import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.core.spi.component.ioc.IoCComponentProviderFactory;
import com.sun.jersey.spi.container.WebApplication;
import com.sun.jersey.spi.spring.container.SpringComponentProviderFactory;


/**
 * This should only be used by a plugin in the plugin.spring.xml file to initialize a Jersey.  The
 * presence of this servlet in the spring file will make it possible to write JAX-RS POJOs in your
 * plugin.
 * @author Aaron Phillips
 */
public class EnunciateJerseyPluginServlet extends EnunciateJerseyServletContainer implements ApplicationContextAware{

  private static final long serialVersionUID = 457538570048660945L;

  private ApplicationContext applicationContext;

  private static final Log logger = LogFactory.getLog(EnunciateJerseyPluginServlet.class);

  private Map<String,String> initParams = new HashMap<String,String>();
  
  public Map<String, String> getInitParams() {
    return initParams;
  }

  public void setInitParams(Map<String, String> initParams) {
    this.initParams = initParams;
  }

  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
    this.applicationContext = applicationContext;
  }
  
  @Override
  public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    logger.debug("servicing request for resource " + request.getPathInfo()); //$NON-NLS-1$
    //Strip out the content generator id from the URL here so Jersey can match the @Path of the resource
    HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(request) {
      
      @Override
      public String getRequestURI() {
        String uri = super.getRequestURI().replace("content/", "");
        return uri;
      }
      
      @Override
      public StringBuffer getRequestURL() {
        String url = super.getRequestURL().toString();
        return new StringBuffer(url.replace("content/", ""));
      }
      
    };
    super.service(wrapper, response);
  }

  @Override
  public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
    super.service(req, res);
  }

  @Override
  protected void initiate(ResourceConfig rc, WebApplication wa) {
    if (logger.isDebugEnabled()) {
      rc.getFeatures().put(ResourceConfig.FEATURE_TRACE, true);
      rc.getFeatures().put(ResourceConfig.FEATURE_TRACE_PER_REQUEST, true);
    }
    super.initiate(rc, wa);
  }
  
  @Override
  public void init(ServletConfig config) throws ServletException {
    ((MutableServletConfig)config).setInitParameters(initParams);
    super.init(config);
  }
  
  @SuppressWarnings("unchecked")
  @Override
  protected IoCComponentProviderFactory loadResourceProviderFacotry(ResourceConfig rc) {
	    try {
	      return new SpringComponentProviderFactory(rc, (ConfigurableApplicationContext)applicationContext);
	    }
	    catch (Throwable e) {
	      throw new IllegalStateException("Unable to load the spring component provider factory.", e);
	    }
	  }

}

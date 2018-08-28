/*******************************************************************************
 * Copyright 2013 Marius Giepz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
package org.saiku.plugin.resources;

import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.spi.container.WebApplication;

import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import org.pentaho.platform.web.servlet.JAXRSPluginServlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ExtendedJAXRSPluginServlet extends JAXRSPluginServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void initiate(ResourceConfig rc, WebApplication wa) {

		rc.getClasses().add(JacksonJaxbJsonProvider.class);
//	    rc.getContainerResponseFilters().add(new GZIPContentEncodingFilter());
		super.initiate(rc, wa);
	}

	@Override
	public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		final ClassLoader origLoader = Thread.currentThread().getContextClassLoader();
		final ClassLoader altLoader = this.getClass().getClassLoader();

		try {
			//temporarily swap out the context classloader to an alternate classloader if 
			//the targetBean has been loaded by one other than the context classloader.
			//This is necessary, so the classes can do a Class.forName and find the service 
			//class specified in the request
			if (altLoader != origLoader) {
				Thread.currentThread().setContextClassLoader(altLoader);
			}
			super.service(request, response);
		} finally {
			//reset the context classloader if necessary
			if ((altLoader != origLoader) && origLoader != null) {
				Thread.currentThread().setContextClassLoader(origLoader);
			}
		}
	}


	}

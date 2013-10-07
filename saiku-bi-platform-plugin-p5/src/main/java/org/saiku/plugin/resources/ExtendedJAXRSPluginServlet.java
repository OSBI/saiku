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

import org.pentaho.platform.web.servlet.JAXRSPluginServlet;

import org.codehaus.jackson.jaxrs.JacksonJaxbJsonProvider;
import com.sun.jersey.api.core.ResourceConfig;
import com.sun.jersey.spi.container.WebApplication;

public class ExtendedJAXRSPluginServlet extends JAXRSPluginServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Override
	protected void initiate(ResourceConfig rc, WebApplication wa) {
		
		rc.getClasses().add(JacksonJaxbJsonProvider.class);
		
		super.initiate(rc, wa);
	}

}

/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package org.saiku.plugin;

import java.io.File;
import java.io.OutputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.enunciate.modules.jersey.EnunciateJerseyServletContainer;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.InvalidParameterException;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.BaseContentGenerator;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.saiku.plugin.util.PluginConfig;
import org.saiku.web.rest.resources.ExporterResource;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.security.wrapper.SavedRequestAwareWrapper;

@SuppressWarnings("serial")
public class ServletAdapterContentGenerator extends BaseContentGenerator {

	private static final Log logger = LogFactory.getLog(ServletAdapterContentGenerator.class);

	private IPluginManager pm = PentahoSystem.get(IPluginManager.class);

	private IParameterProvider requestParameters;

	private static ConfigurableApplicationContext appContext;

	private static final String PLUGIN_ID = PluginConfig.PLUGIN_NAME;

	private static EnunciateJerseyServletContainer servlet;

	public ServletAdapterContentGenerator() throws ServletException {
		final ClassLoader origLoader = Thread.currentThread().getContextClassLoader();
		final PluginClassLoader tempLoader = (PluginClassLoader) pm.getClassLoader(PLUGIN_ID);
		try {
			Thread.currentThread().setContextClassLoader(tempLoader);

			if (appContext == null) {
				appContext = getSpringBeanFactory();
				servlet = (EnunciateJerseyServletContainer) appContext.getBean("enunciatePluginServlet");
				servlet.init(new MutableServletConfig("ServletAdapterContentGenerator"));
			}
		} finally {
			Thread.currentThread().setContextClassLoader(origLoader);
		}
	}

	@Override
	public void createContent() throws Exception {

		final IParameterProvider requestParams = getRequestParameters();
		String background = requestParams.getStringParameter("background_action_name", null);
		String schedule = requestParams.getStringParameter("schedule", null);
//		logger.error("Background: " + background + " Schedule: " + schedule);
		
		if (requestParams != null && (background != null || schedule != null)) {
			createSaikuExport();
		} else {
			createSaikuContent();
		}
	}

	private void createSaikuExport() throws Exception {
			final ClassLoader origLoader = Thread.currentThread().getContextClassLoader();
			final PluginClassLoader tempLoader = (PluginClassLoader) pm.getClassLoader(PLUGIN_ID);
			final IParameterProvider requestParams = getRequestParameters();
			OutputStream out = null;
			if( outputHandler == null ) {
				throw new InvalidParameterException( "SimpleContentGenerator.ERROR_0001_NO_OUTPUT_HANDLER" );  //$NON-NLS-1$
			}

			String solutionName = null;
			if (requestParams != null){
				solutionName = requestParams.getStringParameter("solution", null); //$NON-NLS-1$
			}
			if (solutionName == null){
				solutionName = "NONE"; 
			}

			String filename = requestParams.getStringParameter("action", null);
			filename = filename == null ? "" : filename;
			DateFormat df = new SimpleDateFormat("yyyyMMdd-HHmmss");
			String date = df.format(new Date());
			
			filename = filename + date;
			
			String mimeType = "text/plain";

			ExporterResource ex = (ExporterResource) appContext.getBean("exporterBean");
			if (ex != null) {
				String solution = requestParams.getStringParameter("solution", null);
				String path = requestParams.getStringParameter("path", null);
				String action = requestParams.getStringParameter("action", null);
				String schedule = requestParams.getStringParameter("schedule", null);
				
				
				if (schedule != null) {
					return;
				}

				String file = (solution != null ? solution + "/" : "")
						+ (path != null  ? (path + "/") : "")
						+ (action != null ? action : "");

				//			String exportType = requestParams.getStringParameter("export", null);
				String exportType = "XLS";
				try {
					Thread.currentThread().setContextClassLoader(tempLoader);
					Response r = null;

					if (exportType == null || "XLS".equals(exportType.toUpperCase())) {
						r = ex.exportExcel(file, null, null, null);
						mimeType = "application/vnd.ms-excel";
						filename += ".xls";
						
					} else if ("CSV".equals(exportType.toUpperCase())) {
						r = ex.exportCsv(file, null, null);
						mimeType = "application/csv";
						filename += ".csv";
					}
					setInstanceId(filename);
					
					IContentItem contentItem = outputHandler.getOutputContentItem( "response", "content", solutionName, instanceId, mimeType ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
					if( contentItem == null ) {
						error("SimpleContentGenerator.ERROR_0002_NO_CONTENT_ITEM"); //$NON-NLS-1$
						throw new InvalidParameterException("SimpleContentGenerator.ERROR_0002_NO_CONTENT_ITEM");  //$NON-NLS-1$
					}

					contentItem.setName(filename);
//					
//					logger.error("item: " + itemName);
//					logger.error("instance: " + instanceId);
					out = contentItem.getOutputStream( itemName );
					if( out == null ) {
						error("SimpleContentGenerator.ERROR_0003_NO_OUTPUT_STREAM"); //$NON-NLS-1$
						throw new InvalidParameterException("SimpleContentGenerator.ERROR_0003_NO_OUTPUT_STREAM");  //$NON-NLS-1$
					}
					if (r.getStatus() == 200) {
						out.write( ((byte[]) r.getEntity()));

						try {
							// we created the output stream, let's be sure it's closed
							// do not leave it up to the implementations of SimpleContentGenerator
							// do do this or not
							out.flush();
							out.close();
						} catch (Exception ignored) {
							// this is cleanup code anyway, the output stream was probably
							// closed by the impl
						}    
					}
				} finally {
					Thread.currentThread().setContextClassLoader(origLoader);
				}
			}
	}

	@SuppressWarnings("nls")
	private void createSaikuContent() throws Exception {

		Object requestOrWrapper = this.parameterProviders.get("path").getParameter("httprequest");
		HttpServletRequest request = null;
		if(requestOrWrapper instanceof SavedRequestAwareWrapper) {
			request = (HttpServletRequest) ((SavedRequestAwareWrapper)requestOrWrapper).getRequest();
		} else {
			request = (HttpServletRequest)requestOrWrapper;
		}
		HttpServletResponse response = (HttpServletResponse) this.parameterProviders.get("path").getParameter(
				"httpresponse");

		final ClassLoader origLoader = Thread.currentThread().getContextClassLoader();
		final PluginClassLoader tempLoader = (PluginClassLoader) pm.getClassLoader(PLUGIN_ID);
		try {
			Thread.currentThread().setContextClassLoader(tempLoader);
			servlet.service(request, response);
		} finally {
			Thread.currentThread().setContextClassLoader(origLoader);
		}
	}

	@Override
	public Log getLogger() {
		return logger;
	}

	private ConfigurableApplicationContext getSpringBeanFactory() {
		final PluginClassLoader loader = (PluginClassLoader) pm.getClassLoader(PLUGIN_ID);
		File f = new File(loader.getPluginDir(), "plugin.spring.xml"); //$NON-NLS-1$
		if (f.exists()) {
			logger.debug("Found plugin spring file @ " + f.getAbsolutePath()); //$NON-NLS-1$
			ConfigurableApplicationContext context = new FileSystemXmlApplicationContext("file:" + f.getAbsolutePath()) { //$NON-NLS-1$
				@Override
				protected void initBeanDefinitionReader(XmlBeanDefinitionReader beanDefinitionReader) {

					beanDefinitionReader.setBeanClassLoader(loader);
				}

				@Override
				protected void prepareBeanFactory(ConfigurableListableBeanFactory clBeanFactory) {
					super.prepareBeanFactory(clBeanFactory);
					clBeanFactory.setBeanClassLoader(loader);
				}

				/** Critically important to override this and return the desired CL **/
				@Override
				public ClassLoader getClassLoader() {
					return loader;
				}
			};
			return context;
		}
		throw new IllegalStateException("no plugin.spring.xml file found"); //$NON-NLS-1$
	}

	public IParameterProvider getRequestParameters() {
		if (requestParameters != null) {
			return requestParameters;
		}

		if (parameterProviders == null) {
			return new SimpleParameterProvider();
		}

		IParameterProvider requestParams = parameterProviders.get(IParameterProvider.SCOPE_REQUEST);

		requestParameters = requestParams;
		return requestParams;
	}

}

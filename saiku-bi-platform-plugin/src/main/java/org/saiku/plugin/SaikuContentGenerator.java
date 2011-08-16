/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */

package org.saiku.plugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.OutputStream;
import java.security.InvalidParameterException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.engine.IServiceManager;
import org.pentaho.platform.api.engine.ISolutionFile;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.util.messages.LocaleHelper;
import org.saiku.plugin.util.PluginConfig;

/**
 * A simple content generator that redirects .saiku content to SAIKU 
 *
 * @author Paul Stoellberger
 *
 */
public class SaikuContentGenerator extends SimpleContentGenerator {


	private static final long serialVersionUID = -9180003935693305152L;
	private static final Log LOG = LogFactory.getLog(SaikuContentGenerator.class);

	private String document;

	@Override
	public void createContent() throws Exception {

		if( outputHandler == null ) {
			LOG.error("Outputhandler is null");
			throw new InvalidParameterException("Outputhandler is null");
		}

		IParameterProvider requestParams = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
		if( requestParams == null ) {
			LOG.error("Parameter provider is null");
			throw new NullPointerException("Parameter provider is null");
		}
		String solution = requestParams.getStringParameter("solution", null); //$NON-NLS-1$
		String path = requestParams.getStringParameter("path", null); //$NON-NLS-1$
		String action = requestParams.getStringParameter("action", null); //$NON-NLS-1$
		String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
		ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);
		if( repository == null ) {
			LOG.error("Access to Repository has failed");
			throw new NullPointerException("Access to Repository has failed");
		}

		if(requestParams.getStringParameter("query", null) != null) {
			String query = requestParams.getStringParameter("query", null); //$NON-NLS-1$
			String base = PentahoSystem.getApplicationContext().getSolutionRootPath();
			String parentPath = ActionInfo.buildSolutionPath(solution, path, "");
			ISolutionFile parentFile = repository.getSolutionFile(parentPath, ISolutionRepository.ACTION_CREATE);
			String filePath = parentPath + ISolutionRepository.SEPARATOR + action;
			ISolutionFile fileToSave = repository.getSolutionFile(fullPath, ISolutionRepository.ACTION_UPDATE);

			if (action != null && !action.endsWith(".saiku")) {
				action+= ".saiku";
			}
//			System.out.println("fileToSave:" + fileToSave);
//			System.out.println("!repository.resourceExists(filePath):" + !repository.resourceExists(filePath));
//			System.out.println("parentFile:" + parentFile);

			if (fileToSave != null || (!repository.resourceExists(filePath) && parentFile != null)) {
				repository.publish(base, '/' + parentPath, action, query.getBytes() , true);
				LOG.debug(PluginConfig.PLUGIN_NAME + " : Published " + solution + " / " + path + " / " + action );
			} else {
				throw new Exception("Error ocurred while saving query to solution repository");
			}


			OutputStream out = null;
			IContentItem contentItem = outputHandler.getOutputContentItem("response", "content", "", instanceId, getMimeType()); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
			if (contentItem == null) {
				LOG.error("content item is null"); //$NON-NLS-1$
				throw new NullPointerException("content item is null"); //$NON-NLS-1$
			}

			out = contentItem.getOutputStream(null);
			contentItem.setMimeType("text/html");

			out.flush();
			out.close();
		} else if (repository.resourceExists(fullPath)) {
			String doc = repository.getResourceAsString(fullPath);

			if (doc == null) {
				LOG.error("Error retrieving saiku document from solution repository"); 
				throw new NullPointerException("Error retrieving saiku document from solution repository"); 
			}
			try {
				IServiceManager serviceManager = (IServiceManager) PentahoSystem.get(IServiceManager.class, PentahoSessionHolder.getSession());
				document = doc;
				IContentItem contentItem = outputHandler.getOutputContentItem("response", "content", "", instanceId, getMimeType()); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

				if (contentItem == null) {
					LOG.error("content item is null"); //$NON-NLS-1$
					throw new NullPointerException("content item is null"); //$NON-NLS-1$
				}

				OutputStream out = contentItem.getOutputStream(null);
				createContent(out);

			}
			catch (Exception e) {
				LOG.error("Error loading solution file",e);
				throw new Exception("Error loading solution file",e);
			}

		}
		else {
			super.createContent();
		}

	}

	@Override
	public void createContent(OutputStream out) throws Exception {
		try {
			StringBuilder html = new StringBuilder();
			final IPluginManager pluginManager = (IPluginManager) PentahoSystem.get(IPluginManager.class, PentahoSessionHolder.getSession());
			final PluginClassLoader pluginClassloader = (PluginClassLoader)pluginManager.getClassLoader(PluginConfig.PLUGIN_NAME);
			File pluginDir = pluginClassloader.getPluginDir();

			IParameterProvider requestParams = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
			if( requestParams == null ) {
				LOG.error("Parameter provider is null");
				throw new NullPointerException("Parameter provider is null");
			}
			String run = requestParams.getStringParameter("run", ""); //$NON-NLS-1$

			File indexFile;
			String extrasnippet = "";
			if (run != null && run.equals("table")) {
				indexFile= new File(pluginDir,"ui/run.html");
			} else if (run != null && run.equals("view")) {
				indexFile= new File(pluginDir,"ui/index.html");
				extrasnippet+= "PLUGIN_REMOVE_CONTENT = 'a[href=\"#save_query\"], a[href=\"#automatic_execution\"], a[href=\"#toggle_fields\"], a[href=\"#switch_to_mdx\"], a[href=\"#run_query\"]';\r\n";
				extrasnippet+= "ALLOW_PUC_SAVE = false;\r\n";
				extrasnippet+= "REDUCED = true;\r\n";

			} else {
				indexFile= new File(pluginDir,"ui/index.html");
				extrasnippet+= "PLUGIN_REMOVE_CONTENT = 'a[href=\"#save_query\"]';\r\n";

			}

			FileReader fr = new FileReader(indexFile);
			BufferedReader br = new BufferedReader(fr);
			String inputLine;

			while ((inputLine = br.readLine()) != null) {
				html.append(inputLine);
			}
			int bodyend = html.indexOf("</body>");
			if (bodyend >= 0) {
				html.append("\r\n");
				String snippet ="";
				snippet = "<script type=\"text/javascript\">\r\n";

				if (document != null) {
					document = document.replaceAll("\n", " ").replaceAll("\r", " ").replaceAll("  ", " ");;
					snippet += "QUERY = '" + document + "';\r\n";
				}
				snippet += extrasnippet;
				snippet += "</script>\r\n";
				html.insert(bodyend, snippet);
			}

			out.write(html.toString().getBytes(LocaleHelper.getSystemEncoding()));

		} catch (Exception e) {
			throw new Exception("Error creating content",e);
		}


	}

	public String getMimeType() {
		return "text/html";
	}

	public Log getLogger() {
		return LogFactory.getLog(SaikuContentGenerator.class);
	}

}

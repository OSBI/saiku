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

import java.io.FileReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import mondrian.olap.MondrianProperties;
import mondrian.olap.MondrianServer;
import mondrian.server.DynamicContentFinder;
import mondrian.server.RepositoryContentFinder;
import mondrian.spi.CatalogLocator;
import mondrian.spi.impl.CatalogLocatorImpl;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.Node;
import org.olap4j.OlapConnection;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.api.util.XmlParseException;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.PentahoEntityResolver;
import org.pentaho.platform.engine.services.solution.SolutionReposHelper;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.util.xml.dom4j.XmlDom4JHelper;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.plugin.util.PluginConfig;
import org.xml.sax.EntityResolver;

/**
 * A simple content generator that redirects .xpav content to PAT 
 *
 * @author Paul Stoellberger
 *
 */
public class PentahoConnectionRetriever  {


	private static final Log LOG = LogFactory.getLog(PentahoConnectionRetriever.class);

	private static DynamicContentFinder makeContentFinder(final String dataSources) {
		return new DynamicContentFinder(dataSources) {
		      @Override
		      public String getContent() {
		        String original = super.getContent();
		        EntityResolver loader = new PentahoEntityResolver();
		        Document originalDocument = null;
		        try {
		          originalDocument = XmlDom4JHelper.getDocFromString(original, loader);
		        } catch(XmlParseException e) {
		        	LOG.error(e);
		        	return null;
		        }
		        if (LOG.isDebugEnabled()) {
		          LOG.debug("Original Document:" + originalDocument.asXML()); //$NON-NLS-1$
		        }
		        Document modifiedDocument = (Document) originalDocument.clone();
//		        List<Node> nodesToRemove = modifiedDocument.selectNodes("/DataSources/DataSource/Catalogs/Catalog[contains(DataSourceInfo, 'EnableXmla=False')]"); //$NON-NLS-1$
//		        
//		        for (Node node : nodesToRemove) {
//		          node.detach();
//		        }
		        String modified = modifiedDocument.asXML();
		        modified = modified.replaceAll("solution:", "file:" + PentahoSystem.getApplicationContext().getSolutionPath("") );
		        LOG.debug("MODIFIED MY" + modified);
		        return modified;
		      }
		};
	}


	private static String makeDataSourcesUrl() {
		final String path =
			"file:" + //$NON-NLS-1$
			PentahoSystem
			.getApplicationContext()
			.getSolutionPath("system/olap/datasources.xml");  //$NON-NLS-1$
		if (LOG.isDebugEnabled()) {
			LOG.debug("Pentaho datasources.xml Path:" + path);
		}
		return path;
	}

	public static Map<String,ISaikuConnection> getConnections() {
		Map<String,ISaikuConnection> connections = new HashMap<String,ISaikuConnection>();
		final IPluginManager pluginManager = (IPluginManager) PentahoSystem.get(IPluginManager.class, PentahoSessionHolder.getSession());
		final PluginClassLoader pluginClassloader = (PluginClassLoader)pluginManager.getClassLoader(PluginConfig.PLUGIN_NAME);


		String dataSources = makeDataSourcesUrl();
		RepositoryContentFinder contentFinder = makeContentFinder(dataSources);
		CatalogLocator ci = makeCatalogLocator();

		MondrianProperties.instance().DataSourceResolverClass.setString("org.saiku.plugin.PentahoDataSourceResolver");

		SolutionReposHelper.setSolutionRepositoryThreadVariable(PentahoSystem
		        .get(ISolutionRepository.class, PentahoSessionHolder.getSession()));
		
		MondrianServer server =
			MondrianServer.createWithRepository(contentFinder, ci);

		boolean done = false;
		Integer nr = 0;
		OlapConnection last = null;
		
			OlapConnection con;
			try {
				con = server.getConnection(null, null, null);
				if (con != null && con != last) {
					connections.put(nr.toString(), new SaikuReadyOlapConnection(nr.toString(), con));
					nr++;
				}
				else {
					done = true;
				}

			} catch (SecurityException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		
		return connections;

	}
	
	private static CatalogLocator makeCatalogLocator(){
		return new CatalogLocatorImpl();
//		return new CatalogLocator() {
//			
//			public String locate(String url) {
//				LOG.error("##### MY FILE" + url);
//				if (url != null) {
//					if (url.startsWith("solution:")) {
//						url = url.substring(9);
//					}
//					String catalog =  
//				      PentahoSystem.getApplicationContext().getSolutionPath(url); //$NON-NLS-1$
//					URL u;
//					try {
//						u = new URL("file:" + catalog);
//						catalog = u.toString();
//						LOG.error("##### FILE" + catalog);
//						return catalog;
//					} catch (MalformedURLException e) {
//						// TODO Auto-generated catch block
//						e.printStackTrace();
//					}
//				}
//		        throw new RuntimeException("Cannot locate catalog url:" + url);
//			}
//		};
	}


}

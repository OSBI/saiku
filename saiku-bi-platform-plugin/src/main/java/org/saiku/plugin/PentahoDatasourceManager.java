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

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.user.UserService;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Attribute;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.Node;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.PentahoEntityResolver;
import org.pentaho.platform.util.xml.dom4j.XmlDom4JHelper;
import org.xml.sax.EntityResolver;

import java.util.*;

import javax.jcr.RepositoryException;

import mondrian.olap.MondrianProperties;
import mondrian.olap.Util;
import mondrian.olap.Util.PropertyList;
import mondrian.rolap.RolapConnectionProperties;

public class PentahoDatasourceManager implements IDatasourceManager {

	private static final Log LOG = LogFactory.getLog(PentahoDatasourceManager.class);

	private Map<String,SaikuDatasource> datasources = Collections.synchronizedMap(new HashMap<String,SaikuDatasource>());

	private String saikuDatasourceProcessor;
	
	private String saikuConnectionProcessor;

	private String dynamicSchemaProcessor;

	public void setDatasourceResolverClass(String datasourceResolverClass) {
		MondrianProperties.instance().DataSourceResolverClass.setString(datasourceResolverClass);
	}
	
	public void setSaikuDatasourceProcessor(String datasourceProcessor) {
		this.saikuDatasourceProcessor = datasourceProcessor;
	}
	
	public void setSaikuConnectionProcessor(String connectionProcessor) {
		this.saikuConnectionProcessor = connectionProcessor;
	}
	
	public void setDynamicSchemaProcessor(String dynamicSchemaProcessor) {
		this.dynamicSchemaProcessor = dynamicSchemaProcessor;
	}
	
	public PentahoDatasourceManager() {
	}
	
	public void init() {
		load();
	}

	public void load() {
		datasources.clear();
		String ds = makeDataSourcesUrl();
		loadDatasourcesFromXml(ds);
	}

    public void unload(){

    }

	private void loadDatasourcesFromXml(String dataSources) {
		EntityResolver loader = new PentahoEntityResolver();
		Document doc = null;
		try {
			doc = XmlDom4JHelper.getDocFromFile(dataSources, loader);
			String modified = doc.asXML();
			doc = XmlDom4JHelper.getDocFromString(modified, loader);

			List<Node> nodes = doc.selectNodes("/DataSources/DataSource/Catalogs/Catalog"); //$NON-NLS-1$
			int nr = 0;
			for (Node node : nodes) {
				nr++;
				String name = "PentahoDs" + nr;
				Element e = (Element) node;
				List<Attribute> list = e.attributes();
				for (Attribute attribute : list)
				{
					String aname = attribute.getName();
					if ("name".equals(aname)) {
						name = attribute.getStringValue();  
					}
				}

				Node ds = node.selectSingleNode("DataSourceInfo");
				Node cat = node.selectSingleNode("Definition");
				String connectStr = ds.getStringValue();
				PropertyList pl = Util.parseConnectString(connectStr);
				String dynProcName = pl.get(
		                RolapConnectionProperties.DynamicSchemaProcessor.name());
				if (StringUtils.isNotBlank(dynamicSchemaProcessor) && StringUtils.isBlank(dynProcName)) {
					pl.put(RolapConnectionProperties.DynamicSchemaProcessor.name(), dynamicSchemaProcessor);
					
				}
				LOG.debug("NAME: " + name + " DSINFO: " + pl.toString() + "  ###CATALOG: " +  (cat != null ? cat.getStringValue() : "NULL"));
				Properties props = new Properties();
				props.put("driver", "mondrian.olap4j.MondrianOlap4jDriver");
				props.put("location","jdbc:mondrian:" + pl.toString() + ";Catalog=" + cat.getStringValue());
				if (saikuDatasourceProcessor != null) {
					props.put(ISaikuConnection.DATASOURCE_PROCESSORS, saikuDatasourceProcessor);
				}
				if (saikuConnectionProcessor != null) {
					props.put(ISaikuConnection.CONNECTION_PROCESSORS, saikuConnectionProcessor);
				}
				props.list(System.out);

				SaikuDatasource sd = new SaikuDatasource(name, SaikuDatasource.Type.OLAP, props);
				datasources.put(name, sd);

			}
		} catch(Exception e) {
			e.printStackTrace();
			LOG.error(e);
		}
		if (LOG.isDebugEnabled()) {
			if (doc == null) {
				LOG.debug("Original Document is null");
			}
			else {
				LOG.debug("Original Document:" + doc.asXML()); //$NON-NLS-1$
			}
		}



	}

	private String makeDataSourcesUrl() {
		final String path =
			PentahoSystem
			.getApplicationContext()
			.getSolutionPath("system/olap/datasources.xml");  //$NON-NLS-1$
		if (true) {
			LOG.debug("Pentaho datasources.xml Path:" + path);
		}
		return path;
	}


	public SaikuDatasource addDatasource(SaikuDatasource datasource) {
		throw new UnsupportedOperationException();
	}

	public SaikuDatasource setDatasource(SaikuDatasource datasource) {
		throw new UnsupportedOperationException();
	}

	public List<SaikuDatasource> addDatasources(List<SaikuDatasource> datasources) {
		throw new UnsupportedOperationException();
	}

	public boolean removeDatasource(String datasourceName) {
		throw new UnsupportedOperationException();
	}

    public boolean removeSchema(String schemaName) {
        return false;
    }

    public Map<String,SaikuDatasource> getDatasources() {
		return datasources;
	}

	public SaikuDatasource getDatasource(String datasourceName) {
		return datasources.get(datasourceName);
	}

    public void addSchema(String file, String path, String name) {

    }

    public List<MondrianSchema> getMondrianSchema() {
        return null;
    }

    public MondrianSchema getMondrianSchema(String catalog) {
        //return irm.getMondrianSchema();
        return null;
    }

    public RepositoryFile getFile(String file){
        return null;
    }

    public String getFileData(String s, String s2, List<String> strings) {
        return null;
    }

    public String getInternalFileData(String s) {
        return null;
    }

    public String saveFile(String s, String s2, String s3, List<String> strings) {
        return null;
    }

    public String removeFile(String path, String user, List<String> roles) {
        return null;
    }

    public String moveFile(String source, String target, String user, List<String> roles) {
        return null;
    }

    public String saveInternalFile(String path, String content, String type) {
        return null;
    }

  public void removeInternalFile(String filePath) {

  }

  public List<IRepositoryObject> getFiles(String s, String s2, List<String> strings) {
        return null;
    }

    public void createUser(String s) {

    }

    public void deleteFolder(String s) {

    }

    public AclEntry getACL(String s, String s2, List<String> strings) {
        return null;
    }

    public void setACL(String s, String s2, String s3, List<String> strings) {

    }

    public void setUserService(UserService userService) {

    }

    public List<MondrianSchema> getInternalFilesOfFileType(String type) throws RepositoryException {
        return null;
    }

    public void createFileMixin(String type) throws RepositoryException {

    }

  public byte[] exportRepository() {
	return new byte[0];
  }

  public void restoreRepository(byte[] data) {

  }

  public boolean hasHomeDirectory(String name) {
	return false;
  }

  public void restoreLegacyFiles(byte[] data) {

  }

  public String getFoodmartschema() {
	return null;
  }

  public void setFoodmartschema(String schema) {

  }

  public void setFoodmartdir(String dir) {

  }

  public String getFoodmartdir() {
	return null;
  }

  public String getDatadir() {
	return null;
  }

  public void setDatadir(String dir) {

  }

  public void setFoodmarturl(String foodmarturl) {

  }

  public String getFoodmarturl() {
	return null;
  }

  public String getFileData(String file){

        return null;
    }

}

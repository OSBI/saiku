package org.saiku.plugin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import mondrian.olap.MondrianProperties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.dom4j.Document;
import org.dom4j.Node;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.PentahoEntityResolver;
import org.pentaho.platform.util.xml.dom4j.XmlDom4JHelper;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceManager;
import org.xml.sax.EntityResolver;

public class PentahoDatasourceManager implements IDatasourceManager {

	private static final Log LOG = LogFactory.getLog(PentahoDatasourceManager.class);

	private Map<String,SaikuDatasource> datasources = new HashMap<String,SaikuDatasource>();

	public PentahoDatasourceManager() {
		load();
		MondrianProperties.instance().DataSourceResolverClass.setString("org.saiku.plugin.PentahoDataSourceResolver");

	}


	public void load() {
		String ds = makeDataSourcesUrl();
		loadDatasourcesFromXml(ds);

	}

	private void loadDatasourcesFromXml(String dataSources) {
		EntityResolver loader = new PentahoEntityResolver();
		Document doc = null;
		try {
			doc = XmlDom4JHelper.getDocFromFile(dataSources, loader);
			String modified = doc.asXML();
			modified = modified.replaceAll("solution:", "file:" + PentahoSystem.getApplicationContext().getSolutionPath("") );
			doc = XmlDom4JHelper.getDocFromString(modified, loader);
		} catch(Exception e) {
			LOG.error(e);
		}
		if (LOG.isDebugEnabled()) {
			LOG.debug("Original Document:" + doc.asXML()); //$NON-NLS-1$
		}

		List<Node> nodes = doc.selectNodes("/DataSources/DataSource/Catalogs/Catalog"); //$NON-NLS-1$
		int nr = 0;
		for (Node node : nodes) {
			nr++;
			String name = "PentahoDs" + nr;
			Node ds = node.selectSingleNode("DataSourceInfo");
			Node cat = node.selectSingleNode("Definition");

			System.out.println("NAME: " + name + " DSINFO: " + (ds != null ? ds.getStringValue() : "NULL")+ "  ###" +  (cat != null ? cat.getStringValue() : "NULL"));
			Properties props = new Properties();
			props.put("driver", "mondrian.olap4j.MondrianOlap4jDriver");
			props.put("location","jdbc:mondrian:" + ds.getStringValue() + ";Catalog=" + cat.getStringValue());
			props.list(System.out);

			SaikuDatasource sd = new SaikuDatasource(name, SaikuDatasource.Type.OLAP, props);
			datasources.put(name, sd);

		}


	}


	private String makeDataSourcesUrl() {
		final String path =
			PentahoSystem
			.getApplicationContext()
			.getSolutionPath("system/olap/datasources.xml");  //$NON-NLS-1$
		if (LOG.isDebugEnabled()) {
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

	public Map<String,SaikuDatasource> getDatasources() {
		return datasources;
	}

	public SaikuDatasource getDatasource(String datasourceName) {
		return datasources.get(datasourceName);
	}




}
package org.saiku.service.datasource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.datasources.datasource.SaikuDatasource.Type;
import org.saiku.service.util.exception.SaikuServiceException;

public class ClassPathResourceDatasourceManager implements IDatasourceManager {

	private URL repoURL;

	private Map<String,SaikuDatasource> datasources = new HashMap<String,SaikuDatasource>();

	public ClassPathResourceDatasourceManager() {
		
	}

		
	public ClassPathResourceDatasourceManager(String path) {
		repoURL = this.getClass().getClassLoader().getResource(path);
		if (repoURL == null) {
			throw new SaikuServiceException("Cannot load connection repository from path:"+path);
		} else {
			load();
		}
	}

	public void setPath(String path) {
		repoURL = this.getClass().getClassLoader().getResource(path);
		load();
	}

	public void load() {
		try {
			if (repoURL != null) {
				if ( repoURL.getProtocol().equals("file")) {
					File[] files =  new File(repoURL.toURI()).listFiles();

					for (File file : files) {
						if (!file.isHidden()) {
							Properties props = new Properties();
							props.load(new FileInputStream(file));
							String name = props.getProperty("name");
							String type = props.getProperty("type");
							props.list(System.out);
							Type t = SaikuDatasource.Type.valueOf(type.toUpperCase());
							SaikuDatasource ds = new SaikuDatasource(name,t,props);
							datasources.put(name, ds);
						}
					}
				}
			}
			else {
				throw new Exception("repo URL is null");
			}
		} catch (Exception e) {
			throw new SaikuServiceException(e.getMessage(),e);
		}		
	}

	public SaikuDatasource addDatasource(SaikuDatasource datasource) {
		try { 
			String uri = repoURL.toURI().toString();
			if (uri != null && datasource != null) {
				uri += datasource.getName().replace(" ", "_");
				File dsFile = new File(new URI(uri));
				if (dsFile.exists()) {
					dsFile.delete();
				}
				else {
					dsFile.createNewFile();
				}
				FileWriter fw = new FileWriter(dsFile);
				Properties props = datasource.getProperties();
				props.store(fw, null);
				fw.close();
				datasources.put(datasource.getName(), datasource);
				return datasource;

			}
			else {
				throw new SaikuServiceException("Cannot save datasource because uri or datasource is null uri(" 
						+ (uri == null) + ")" );
			}
		}
		catch (Exception e) {
			throw new SaikuServiceException("Error saving datasource",e);
		}
	}

	public SaikuDatasource setDatasource(SaikuDatasource datasource) {
		return addDatasource(datasource);
	}

	public List<SaikuDatasource> addDatasources(List<SaikuDatasource> datasources) {
		for (SaikuDatasource ds : datasources) {
			addDatasource(ds);
		}
		return datasources;
	}

	public boolean removeDatasource(String datasourceName) {
		try {
			String uri = repoURL.toURI().toString();
			if (uri != null) {
				// seems like we don't have to do this anymore
				//uri.toString().endsWith(String.valueOf(File.separatorChar))) {
				uri += datasourceName;
				File dsFile = new File(new URI(uri));
				if (dsFile.delete()) {
					datasources.remove(datasourceName);
					return true;
				}
			}
			throw new Exception("Cannot delete datasource file uri:" + uri);
		}
		catch(Exception e){
			throw new SaikuServiceException("Cannot delete datasource",e);
		}
	}

	public Map<String,SaikuDatasource> getDatasources() {
		return datasources;
	}
	
	public SaikuDatasource getDatasource(String datasourceName) {
		return datasources.get(datasourceName);
	}


}
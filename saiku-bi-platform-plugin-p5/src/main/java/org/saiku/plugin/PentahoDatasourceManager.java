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

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.saiku.database.dto.MondrianSchema;
import org.saiku.datasources.connection.ISaikuConnection;
import org.saiku.datasources.connection.RepositoryFile;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.repository.AclEntry;
import org.saiku.repository.IRepositoryObject;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.importer.JujuSource;
import org.saiku.service.user.UserService;
import org.saiku.service.util.exception.SaikuServiceException;

import org.pentaho.platform.api.engine.IPentahoSession;
import org.pentaho.platform.api.repository.RepositoryException;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.plugin.action.mondrian.catalog.IMondrianCatalogService;
import org.pentaho.platform.plugin.action.mondrian.catalog.MondrianCatalog;
import org.pentaho.platform.util.messages.LocaleHelper;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.xml.bind.DatatypeConverter;

import mondrian.olap.MondrianProperties;
import mondrian.olap.Util;
import mondrian.rolap.RolapConnectionProperties;
import mondrian.util.Pair;
import pt.webdetails.cpf.repository.api.FileAccess;
import pt.webdetails.cpf.repository.api.IBasicFile;
import pt.webdetails.cpf.repository.api.IContentAccessFactory;
import pt.webdetails.cpf.repository.api.IUserContentAccess;


public class PentahoDatasourceManager implements IDatasourceManager {

    private static final Log LOG = LogFactory.getLog(PentahoDatasourceManager.class);

    @Autowired
    private IContentAccessFactory contentAccessFactory;

    private Map<String, SaikuDatasource> datasources =      Collections.synchronizedMap(new HashMap<String, SaikuDatasource>());
    
	private String saikuDatasourceProcessor;

    private String saikuConnectionProcessor;

    private String dynamicSchemaProcessor;

    private IPentahoSession session;

    private IMondrianCatalogService catalogService;

    private String datasourceResolver;

    /*START CODE Xpand-IT*/
    private String xmlaUrl;
    private String xmlaDriver;
    private String xmlaSecurityEnabled;

    public void setXmlaUrl(String url){
        this.xmlaUrl = url;
    }
      
    public void setXmlaDriver(String driv){
        this.xmlaDriver = driv;
    }
    
    public void setXmlaSecurityEnabled(String secEnabled){
        this.xmlaSecurityEnabled = secEnabled;
    }      

    /*END CODE Xpand-IT*/
	
	public void setDatasourceResolverClass(String datasourceResolverClass) {
        this.datasourceResolver = datasourceResolverClass;
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
        loadDatasources();
    }

    public void unload() {

    }

    private Map<String, SaikuDatasource> loadDatasources() {
        try {
            this.session = PentahoSessionHolder.getSession();

            ClassLoader cl = this.getClass().getClassLoader();
            ClassLoader cl2 = this.getClass().getClassLoader().getParent();

            Thread.currentThread().setContextClassLoader(cl2);
            this.catalogService = PentahoSystem.get(IMondrianCatalogService.class,
                session);

            List<MondrianCatalog> catalogs = catalogService.listCatalogs(session, true);
            Thread.currentThread().setContextClassLoader(cl);
            if (StringUtils.isNotBlank(this.datasourceResolver)) {
                MondrianProperties.instance().DataSourceResolverClass.setString(this.datasourceResolver);
            }

            for (MondrianCatalog catalog : catalogs) {
                String name = catalog.getName();
                Util.PropertyList parsedProperties = Util.parseConnectString(catalog
                        .getDataSourceInfo());

                String dynProcName = parsedProperties.get(
                        RolapConnectionProperties.DynamicSchemaProcessor.name());
                if (StringUtils.isNotBlank(dynamicSchemaProcessor) && StringUtils.isBlank(dynProcName)) {
                    parsedProperties.put(RolapConnectionProperties.DynamicSchemaProcessor.name(), dynamicSchemaProcessor);

                }

                StringBuilder builder = new StringBuilder();
                builder.append("jdbc:mondrian:");
                builder.append("Catalog=");
                builder.append(catalog.getDefinition());
                builder.append("; ");

                Iterator<Pair<String, String>> it = parsedProperties.iterator();

                while (it.hasNext()) {
                    Pair<String, String> pair = it.next();
                    builder.append(pair.getKey());
                    builder.append("=");
                    builder.append(pair.getValue());
                    builder.append("; ");
                }

//				builder.append("PoolNeeded=false; ");

                builder.append("Locale=");
                if (session != null) {
                    builder.append(session.getLocale().toString());
                } else {
                    builder.append(LocaleHelper.getLocale().toString());
                }
                builder.append(";");

                String url = builder.toString();

                LOG.debug("NAME: " + catalog.getName() + " DSINFO: " + url + "  ###CATALOG: " + catalog.getName());

                Properties props = new Properties();
                props.put("driver", "mondrian.olap4j.MondrianOlap4jDriver");
                props.put("location", url);

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
			
			/*START CODE Xpand-IT*/

            if (this.xmlaUrl != null){

                String urlRoles = this.xmlaUrl;
                Properties props2 = new Properties();
                props2.put("driver", this.xmlaDriver);
                props2.put("location", urlRoles);
                
                /* Use security? */                
                props2.put(ISaikuConnection.SECURITY_ENABLED_KEY, this.xmlaSecurityEnabled);
                //props2.put(ISaikuConnection.SECURITY_TYPE_KEY, this.xmlaSecurityType); 
                
                if (this.saikuDatasourceProcessor != null) {
                  props2.put("datasource.processors", this.saikuDatasourceProcessor);
                }
                if (this.saikuConnectionProcessor != null) {
                  props2.put("connection.processors", this.saikuConnectionProcessor);
                }
                props2.list(System.out);
                
                String name2 = "xmla";
                SaikuDatasource sd2 = new SaikuDatasource(name2, SaikuDatasource.Type.OLAP, props2);
                this.datasources.put(name2, sd2);
                LOG.debug("NAME: " + name2 + " DSINFO: " + urlRoles + "  ###CATALOG: " + this.xmlaDriver);
            }  

            /*END CODE Xpand-IT*/
            
			return datasources;
        
		} catch (Exception e) {
            e.printStackTrace();
            LOG.error(e);
        }
        return new HashMap<String, SaikuDatasource>();
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

    public Map<String, SaikuDatasource> getDatasources() {
        return loadDatasources();
    }

    public SaikuDatasource getDatasource(String datasourceName) {
        return loadDatasources().get(datasourceName);
    }

    @Override
    public SaikuDatasource getDatasource(String datasourceName, boolean refresh) {
        return loadDatasources().get(datasourceName);
    }

    public void addSchema(String file, String path, String name) {
        throw new UnsupportedOperationException();
    }

    public List<MondrianSchema> getMondrianSchema() {
        throw new UnsupportedOperationException();
    }

    public MondrianSchema getMondrianSchema(String catalog) {
        throw new UnsupportedOperationException();
    }

    public RepositoryFile getFile(String file) {
        throw new UnsupportedOperationException();
    }

    public String getFileData(String file) {
        throw new UnsupportedOperationException();
    }

    public void setUserService(UserService us) {

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

    @Override
    public String getEarthquakeUrl() {
        return null;
    }

    @Override
    public String getEarthquakeDir() {
        return null;
    }

    @Override
    public String getEarthquakeSchema() {
        return null;
    }

    @Override
    public void setEarthquakeUrl(String earthquakeUrl) {

    }

    @Override
    public void setEarthquakeDir(String earthquakeDir) {

    }

    @Override
    public void setEarthquakeSchema(String earthquakeSchema) {

    }

    @Override
    public void setExternalPropertiesFile(String file) {

    }

    @Override
    public String[] getAvailablePropertiesKeys() {
        return new String[0];
    }

    @Override
    public List<JujuSource> getJujuDatasources() {
        return null;
    }

    public void setACL(String a, String b, String c, List<String> d) {

    }

    public AclEntry getACL(String a, String b, List<String> c) {
        throw new UnsupportedOperationException();
    }

    public void deleteFolder(String folder) {
        throw new UnsupportedOperationException();
    }

    public void createUser(String username) {
        throw new UnsupportedOperationException();
    }

    public List<IRepositoryObject> getFiles(String type, String username, List<String> roles) {
        throw new UnsupportedOperationException();
    }

    public List<IRepositoryObject> getFiles(String type, String username, List<String> roles, String path) {
        throw new UnsupportedOperationException();
    }

    public String saveFile(String path, String content, String user, List<String> roles) {
        throw new UnsupportedOperationException();

    }

    public String removeFile(String path, String user, List<String> roles) {
        return null;
    }

    public String moveFile(String source, String target, String user, List<String> roles) {
        return null;
    }

    public String saveInternalFile(String path, Object content, String type) {
        return null;
    }

    public String saveBinaryInternalFile(String path, InputStream content, String type) {
        return null;
    }

    public String saveInternalFile(String path, String content, String type) {
        return null;
    }

    public void removeInternalFile(String filePath) {
    
    }

    @Override
    public List<IRepositoryObject> getFiles(List<String> type, String username, List<String> roles) {
        return null;
    }

    @Override
    public List<IRepositoryObject> getFiles(List<String> type, String username, List<String> roles, String path) {
        return null;
    }

    public String getInternalFileData(String file) {
        IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);

        if( !access.fileExists(file) && access.hasAccess(file, FileAccess.READ)) {
            //log.error("Access to Repository has failed File does not exist: " + file);
            throw new NullPointerException("Access to Repository has failed");
        }
        IBasicFile bf = access.fetchFile(file);

        String doc = null;
        try {
            doc = IOUtils.toString(bf.getContents());
        } catch (IOException e) {
            e.printStackTrace();
        }
        if (doc == null) {
            throw new SaikuServiceException("Error retrieving saiku document from solution repository: " + file);
        }
        return doc;
    }

    private static Object objFromString( String s ) throws IOException ,
        ClassNotFoundException {
        byte [] data = DatatypeConverter.parseBase64Binary(s);
        ObjectInputStream ois = new ObjectInputStream(
            new ByteArrayInputStream(  data ) );
        Object o  = ois.readObject();
        ois.close();
        return o;
    }

    public InputStream getBinaryInternalFileData(String file) throws javax.jcr.RepositoryException {
        IUserContentAccess access = contentAccessFactory.getUserContentAccess(null);

        if( !access.fileExists(file) && access.hasAccess(file, FileAccess.READ)) {
            //log.error("Access to Repository has failed File does not exist: " + file);
            throw new NullPointerException("Access to Repository has failed");
        }
        IBasicFile bf = access.fetchFile(file);


        try {
            String s = IOUtils.toString(bf.getContents());

            try {
                Object o = objFromString(s);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ObjectOutputStream oos = new ObjectOutputStream(baos);


                oos.writeObject(o);

                oos.flush();
                oos.close();

                return new ByteArrayInputStream(baos.toByteArray());
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
            return bf.getContents();
        } catch (IOException e) {
            throw new NullPointerException("No data: "+e.getLocalizedMessage());
        }

    }

    public String saveFile(String path, Object content, String user, List<String> roles) {
        return null;
    }

    public String getFileData(String file, String username, List<String> roles) {
        throw new UnsupportedOperationException();
    }
}

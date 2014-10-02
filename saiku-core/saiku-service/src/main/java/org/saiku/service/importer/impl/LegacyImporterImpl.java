package org.saiku.service.importer.impl;

import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.datasource.RepositoryDatasourceManager;
import org.saiku.service.importer.LegacyImporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Created by bugg on 19/06/14.
 */
public class LegacyImporterImpl implements LegacyImporter {
    private static final Logger log = LoggerFactory.getLogger(LegacyImporter.class);
    private final IDatasourceManager dsm;

    private URL repoURL;



    public LegacyImporterImpl(IDatasourceManager dsm) {
        this.dsm = dsm;
    }



    public void importUsers() {
        setPath("res:");
    }

    public void importSchema() {
        setPath("res:legacy-schema");


        try {
            if ( repoURL != null ) {
                File[] files = new File( repoURL.getFile() ).listFiles();
                if (files != null) {
                    for ( File file : files ) {
                        if ( !file.isHidden() && !file.getName().equals("README")) {
                            byte[] encoded = null;
                            try {
                                encoded = org.apache.commons.io.IOUtils.toByteArray(new FileInputStream(file));
                            } catch (IOException e1) {
                                e1.printStackTrace();
                            }
                            String str = null;
                            if (encoded != null) {
                                str = new String(encoded, Charset.forName("UTF8"));
                            }
                            dsm.addSchema(str,"/datasources/"+file.getName(),"admin");
                            }
                        }
                }
            }
            } catch (Exception e1) {
            e1.printStackTrace();
        }

    }

    public void importDatasources() {
        setPath("res:legacy-datasources");

        try {
            if (repoURL != null) {
                File[] files = new File(repoURL.getFile()).listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (!file.isHidden() && !file.getName().equals("README")) {
                            Properties props = new Properties();
                            try {
                                props.load(new FileInputStream(file));
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            String name = props.getProperty("name");
                            String type = props.getProperty("type");
                            if(props.getProperty("location")!=null){
                                String toSplit = props.getProperty("location");
                                String split[] = toSplit.split(";");

                                for(int i = 0; i<split.length; i++){
                                    String s = split[i];
                                    if(s.startsWith("Catalog=")){
                                        Path p = Paths.get(s.substring(8,s.length()));
                                        String f = p.getFileName().toString();

                                        String fixedString = "Catalog=mondrian:///datasources/"+f;

                                        split[i] = fixedString;
                                        StringBuilder builder = new StringBuilder();
                                        for(String str : split){
                                            builder.append(str+";");
                                        }
                                        props.setProperty("location", builder.toString());

                                    }
                                }

                            }
                            if (name != null && type != null) {
                                props.put("id", java.util.UUID.randomUUID().toString());
                                SaikuDatasource.Type t = SaikuDatasource.Type.valueOf(type.toUpperCase());
                                SaikuDatasource ds = new SaikuDatasource(name, t, props);

                                dsm.addDatasource(ds);
                            }
                        }
                    }
                }

            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void setPath( String path ) {

        FileSystemManager fileSystemManager;
        try {
            fileSystemManager = VFS.getManager();

            FileObject fileObject;
            fileObject = fileSystemManager.resolveFile( path );
            if ( fileObject == null ) {
                throw new IOException( "File cannot be resolved: " + path );
            }
            if ( !fileObject.exists() ) {
                throw new IOException( "File does not exist: " + path );
            }
            repoURL = fileObject.getURL();
            if ( repoURL == null ) {
                throw new Exception( "Cannot load connection repository from path: " + path );
            } else {
                //load();
            }
        } catch ( Exception e ) {
            log.error("Exception",e);
        }

    }

}

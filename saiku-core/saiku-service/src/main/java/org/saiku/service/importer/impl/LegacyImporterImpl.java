package org.saiku.service.importer.impl;

import org.apache.commons.vfs.FileObject;
import org.apache.commons.vfs.FileSystemManager;
import org.apache.commons.vfs.VFS;
import org.saiku.service.importer.LegacyImporter;

import java.io.IOException;
import java.net.URL;

/**
 * Created by bugg on 19/06/14.
 */
public class LegacyImporterImpl implements LegacyImporter {
    private URL repoURL;

    public void importUsers() {
        setPath("res:");
    }

    public void importSchema() {
        setPath("res:");
    }

    public void importDatasources() {

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
            e.printStackTrace();
        }

    }

}

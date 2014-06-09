/*
 *   Copyright 2014 OSBI Ltd
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

package org.saiku.service.datasource;

import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.repository.DataSource;
import org.saiku.repository.IRepositoryManager;
import org.saiku.repository.JackRabbitRepositoryManager;
import org.saiku.service.util.exception.SaikuServiceException;

import javax.jcr.RepositoryException;
import java.util.*;

/**
 * A Datasource Manager for the Saiku Repository API layer.
 */
public class RepositoryDatasourceManager implements IDatasourceManager {
    private Map<String, SaikuDatasource> datasources =
            Collections.synchronizedMap(new HashMap<String, SaikuDatasource>());

    IRepositoryManager irm = JackRabbitRepositoryManager.getJackRabbitRepositoryManager();
    public void load() {
        try {
            irm.start();
        } catch (RepositoryException e) {
            e.printStackTrace();
        }
        datasources.clear();
        try {

            List<DataSource> exporteddatasources = null;
            try {
                exporteddatasources = irm.getAllDataSources();
            } catch (RepositoryException e1) {
                e1.printStackTrace();
            }

            if (exporteddatasources != null) {
                for ( DataSource file : exporteddatasources ) {
                            if ( file.getName() != null && file.getType() != null ) {
                                Properties props = new Properties();
                                props.put("driver", file.getDriver());
                                props.put("location", file.getLocation());
                                props.put("username", file.getUsername());
                                props.put("password", file.getPassword());
                                SaikuDatasource.Type t = SaikuDatasource.Type.valueOf( file.getType().toUpperCase() );
                                SaikuDatasource ds = new SaikuDatasource( file.getName(), t, props );
                                datasources.put( file.getName(), ds );
                            }
                        }
            }


        } catch ( Exception e ) {
            throw new SaikuServiceException( e.getMessage(), e );
        }
    }

    public void unload(){
        irm.shutdown();
    }
    public SaikuDatasource addDatasource(SaikuDatasource datasource) {
        DataSource ds = new DataSource(datasource);

        try {
            irm.saveDataSource(ds, "/datasources/"+ds.getName()+".sds", "fixme");
            datasources.put( datasource.getName(), datasource );
        } catch (RepositoryException e) {
            e.printStackTrace();
        }

        return datasource;
    }

    public SaikuDatasource setDatasource(SaikuDatasource datasource) {
        return null;
    }

    public List<SaikuDatasource> addDatasources(List<SaikuDatasource> dsources) {
        for(SaikuDatasource datasource : dsources) {
            DataSource ds = new DataSource(datasource);

            try {
                irm.saveDataSource(ds, "/datasources/"+ds.getName()+".sds", "fixme");
                datasources.put( datasource.getName(), datasource );

            } catch (RepositoryException e) {
                e.printStackTrace();
            }

        }
        return dsources;
    }

    public boolean removeDatasource(String datasourceName) {
        return false;
    }

    public Map<String, SaikuDatasource> getDatasources() {
        return datasources;
    }

    public SaikuDatasource getDatasource(String datasourceName) {
        return datasources.get( datasourceName );
    }
}

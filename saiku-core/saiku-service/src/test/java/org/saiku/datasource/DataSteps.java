/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.saiku.datasource;

import org.saiku.datasources.connection.IConnectionManager;
import org.saiku.datasources.connection.impl.SimpleConnectionManager;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.helper.DatabaseHelper;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.DatasourceService;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.datasource.RepositoryDatasourceManager;
import org.saiku.service.olap.OlapDiscoverService;
import org.saiku.service.olap.ThinQueryService;
import org.saiku.service.util.exception.SaikuServiceException;

import net.thucydides.core.annotations.Step;

import org.jetbrains.annotations.NotNull;
import org.junit.Test;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * Data steps for OlapDataSourceStepsdef
 */
public class DataSteps {

  public static boolean debug = false;
  @NotNull
  private static final Properties TESTPROPS = new Properties();
  private IDatasourceManager datasourceManager;
  private IConnectionManager connectionManager;
  private OlapMetaExplorer olapMetaExplorer;
  private OlapDiscoverService olapDiscoverService;
  private DatasourceService datasourceService;
  private ThinQueryService thinQueryService;
  private List<String> data;


  private void setup() throws Exception {
    DatabaseHelper db = new DatabaseHelper();
    db.setup();
    InputStream inputStream = getClass().getResourceAsStream("../connection.properties");
    TESTPROPS.load(inputStream); //$NON-NLS-1$


    File f = new File(System.getProperty("java.io.tmpdir") + "/files/");
    f.mkdir();
    //this.datasourceManager = new ClassPathResourceDatasourceManager("res:saiku-org.saiku.datasources");

    this.datasourceManager =
        new RepositoryDatasourceManager();
    //InputStream inputStream= DataSteps.class.getResourceAsStream("connection.properties");
    TESTPROPS.load(inputStream);
    this.datasourceManager.load();
    this.connectionManager = new SimpleConnectionManager();
    this.connectionManager.setDataSourceManager(datasourceManager);
    this.connectionManager.init();
    this.olapMetaExplorer = new OlapMetaExplorer(connectionManager);
    this.datasourceService = new DatasourceService();
    this.datasourceService.setConnectionManager(connectionManager);
    this.olapDiscoverService = new OlapDiscoverService();
    this.olapDiscoverService.setDatasourceService(datasourceService);
    this.thinQueryService = new ThinQueryService();
    thinQueryService.setOlapDiscoverService(olapDiscoverService);
  }

  @Step
  public void load() throws Exception {
    setup();


    List<SaikuDatasource> l = new ArrayList<SaikuDatasource>();


    if (data != null) {
      for (String s : data) {
        l.add(new SaikuDatasource(s, SaikuDatasource.Type.OLAP, TESTPROPS));
      }
    }

    datasourceManager.addDatasources(l);

  }

  @Step
  public void createDataSources(List<String> data) {
    this.data = data;

  }

  @Step
  public void loadNewDataSources() throws Exception {
    setup();
    List<SaikuDatasource> l = new ArrayList<SaikuDatasource>();

    if (data != null) {
      for (String s : data) {
        l.add(new SaikuDatasource(s, SaikuDatasource.Type.OLAP, TESTPROPS));
      }
    }

    datasourceManager.addDatasources(l);
  }

  @Step
  public void loadsingle() throws Exception {
    setup();

    if (data != null) {

      datasourceManager.addDatasource(new SaikuDatasource(data.get(0), SaikuDatasource.Type.OLAP, TESTPROPS));

    }

  }

  @Step
  @Test(expected = SaikuServiceException.class)
  public void createInvalidDataSources() throws Exception {
    setup();

    datasourceManager.setDatasource(new SaikuDatasource("test", SaikuDatasource.Type.OLAP, TESTPROPS));

  }

  @Step
  public SaikuConnection getConnection(String name) throws SaikuOlapException {
    return olapMetaExplorer.getConnection(name);

  }

  @NotNull
  @Step
  public List<SaikuConnection> getDatasources() throws SaikuOlapException {
    return olapMetaExplorer.getAllConnections();
  }

  @Step
  @Test(expected = SaikuOlapException.class)
  public SaikuConnection getInvalidDatasource(String nonexistant) throws SaikuOlapException {
    try {
      return olapMetaExplorer.getConnection(nonexistant);
    } catch (SaikuOlapException e) {
      throw new SaikuOlapException("Olap Exception");
    }
  }

  @Step
  public SaikuConnection getDatasource(String nonexistant) throws SaikuOlapException {
    try {
      return olapMetaExplorer.getConnection(nonexistant);
    } catch (SaikuOlapException e) {
      throw new SaikuOlapException("Olap Exception");
    }
  }

  public void addDataSources(List<String> l) {
    this.data = l;
  }

  public void removeDatasource(String foodmart) {

  }

  @Step
  public void shutdownRepository() {
    if (datasourceManager != null) {
      datasourceManager.unload();
    } else {
      //Log message
    }
  }

}

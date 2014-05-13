package org.saiku;

import net.thucydides.core.annotations.Step;
import net.thucydides.core.annotations.StepProvider;
import org.junit.Test;
import org.saiku.datasources.connection.IConnectionManager;
import org.saiku.datasources.datasource.SaikuDatasource;
import org.saiku.olap.discover.OlapMetaExplorer;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.util.exception.SaikuOlapException;
import org.saiku.service.datasource.ClassPathResourceDatasourceManager;
import org.saiku.service.datasource.IDatasourceManager;
import org.saiku.service.util.exception.SaikuServiceException;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * Created by bugg on 02/05/14.
 */
public class DataSteps {

  private static OlapMetaExplorer olapMetaExplorer;
  private static Properties testProps = new Properties();
  private List<String> data;

  @Step
  public void load() throws IOException {
    AbstractServiceUtils ast = new AbstractServiceUtils();
    ast.initTestContext();
    IConnectionManager ic = new TConnectionManager();
    String returned = computeTestDataRoot(DataSteps.class);
    File f = new File(System.getProperty("java.io.tmpdir")+"/files/");
    f.mkdir();
    IDatasourceManager ds = new ClassPathResourceDatasourceManager(System.getProperty("java.io.tmpdir")+"/files/");
    InputStream inputStream= DataSteps.class.getResourceAsStream("connection.properties");
    try {
      testProps.load(inputStream);
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    List<SaikuDatasource> l = new ArrayList<SaikuDatasource>(  );

    if(data!=null) {
      for ( String s : data ) {
        l.add( new SaikuDatasource( s, SaikuDatasource.Type.OLAP, testProps ) );
      }
    }

    ds.addDatasources( l );

    ic.setDataSourceManager(ds);
    olapMetaExplorer = new OlapMetaExplorer(ic);
  }

  @Step
  public void createDataSources(List<String> data) {
    this.data = data;

  }

  @Step
  public void loadNewDataSources(){
    List<SaikuDatasource> l = new ArrayList<SaikuDatasource>(  );

    if(data!=null) {
      for ( String s : data ) {
        l.add( new SaikuDatasource( s, SaikuDatasource.Type.OLAP, testProps ) );
      }
    }
    IDatasourceManager ds = new ClassPathResourceDatasourceManager(System.getProperty("java.io.tmpdir")+"/files/");

    ds.addDatasources( l );

    IConnectionManager ic = new TConnectionManager();

    ic.setDataSourceManager(ds);
    olapMetaExplorer = new OlapMetaExplorer(ic);
  }
  @Step
  public void loadsingle() throws IOException {
    AbstractServiceUtils ast = new AbstractServiceUtils();
    ast.initTestContext();
    IConnectionManager ic = new TConnectionManager();
    String returned = computeTestDataRoot(DataSteps.class);
    File f = new File(System.getProperty("java.io.tmpdir")+"/files/");
    f.mkdir();
    IDatasourceManager ds = new ClassPathResourceDatasourceManager(System.getProperty("java.io.tmpdir")+"/files/");
    InputStream inputStream= DataSteps.class.getResourceAsStream("connection.properties");
    try {
      testProps.load(inputStream);
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    if(data!=null) {

        ds.setDatasource( new SaikuDatasource( data.get( 0 ), SaikuDatasource.Type.OLAP, testProps ) );

    }

    ic.setDataSourceManager(ds);
    olapMetaExplorer = new OlapMetaExplorer(ic);
  }

  @Step
  @Test(expected=SaikuServiceException.class)
  public void createInvalidDataSources() throws IOException {
    AbstractServiceUtils ast = new AbstractServiceUtils();
    ast.initTestContext();
    IConnectionManager ic = new TConnectionManager();
    String returned = computeTestDataRoot(DataSteps.class);
    File f = new File(System.getProperty("java.io.tmpdir")+"/files/");
    f.mkdir();
    IDatasourceManager ds = new ClassPathResourceDatasourceManager("/tmp/empty/");
    InputStream inputStream= DataSteps.class.getResourceAsStream("connection.properties");
    testProps.load(inputStream);


    ds.setDatasource( new SaikuDatasource( "test", SaikuDatasource.Type.OLAP, testProps ) );



    ic.setDataSourceManager(ds);
    olapMetaExplorer = new OlapMetaExplorer(ic);

  }

  @Step
  public SaikuConnection getConnection(String name) throws SaikuOlapException {
    return olapMetaExplorer.getConnection(name);

  }
  @Step
  public List<SaikuConnection> getDatasources() throws SaikuOlapException {
    return olapMetaExplorer.getAllConnections();
  }

  @Step
  @Test(expected=SaikuOlapException.class)
  public SaikuConnection getInvalidDatasource( String nonexistant ) throws SaikuOlapException {
    try {
      return olapMetaExplorer.getConnection( nonexistant );
    } catch ( SaikuOlapException e ) {
      throw new SaikuOlapException( "Olap Exception" );
    }
  }


  public static String computeTestDataRoot(Class anyTestClass) throws IOException {

    //create a temp file
    File temp = File.createTempFile("temp-file-name", ".tmp");

    System.out.println("Temp file : " + temp.getAbsolutePath());

    //Get tempropary file path
    String absolutePath = temp.getAbsolutePath();
    String tempFilePath = absolutePath.
      substring(0,absolutePath.lastIndexOf(File.separator));
    return tempFilePath+"/";
  }

  @Step
  public SaikuConnection getDatasource( String nonexistant ) throws SaikuOlapException {
    try {
      return olapMetaExplorer.getConnection( nonexistant );
    } catch ( SaikuOlapException e ) {
      throw new SaikuOlapException( "Olap Exception" );
    }
  }

  public void addDataSources( List<String> l ) {
    this.data = l;
  }

  public void removeDatasource( String foodmart ) {

  }
}

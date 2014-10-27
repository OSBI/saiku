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
package org.saiku.web;

import org.saiku.service.olap.OlapDiscoverService;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

//import org.saiku.service.olap.OlapDiscoverService;

public class DataSourceInterfaceTest extends AbstractServiceTest {
  /**
   *
   */
  private static final long serialVersionUID = 1L;

  protected OlapDiscoverService olapDiscoverService = null;


  @Test
  public void testCheckDefaultConnection() {

  }

  @Test
  public void testApplicationWadl() {
/*
        Client client = Client.create();
        client.setFollowRedirects(false);

        WebResource webResource = client.resource("http://localhost:9999/saiku");

        String applicationWadl = webResource.path("application.wadl").get(String.class);
        System.out.println(applicationWadl);
        assertTrue("Something wrong. Returned wadl length is not > 0",
                applicationWadl.length() > 0);*/
  }

  @Test
  public void testConvertDataSourcesToJson() {
    Client client = Client.create();
    client.setFollowRedirects(false);

    WebResource webResource = client.resource("http://localhost:9999/saiku");
    String applicationWadl =
        webResource.path("/rest/saiku/bugg/org.saiku.datasources").accept("application/json").get(String.class);
    System.out.println(applicationWadl);
    assertEquals(
        "[{\"connection\":\"TestConnection1\",\"cube\":\"Quadrant Analysis\",\"catalog\":\"SampleData\",\"schema\":\"SampleData\"},{\"connection\":\"TestConnection1\",\"cube\":\"SteelWheelsSales\",\"catalog\":\"SteelWheels\",\"schema\":\"SteelWheels\"}]",
        applicationWadl);

  }


  @Ignore
  @Test
  public void testConvertDataSourcesToXML() {
    Client client = Client.create();
    client.setFollowRedirects(false);

    WebResource webResource = client.resource("http://localhost:9999/saiku");
    String applicationWadl =
        webResource.path("/rest/saiku/bugg/org.saiku.datasources").accept("application/xml").get(String.class);
    System.out.println(applicationWadl);
    assertEquals(
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><items><datasource connection=\"TestConnection1\" cube=\"Quadrant Analysis\" catalog=\"SampleData\" schema=\"SampleData\"/><datasource connection=\"TestConnection1\" cube=\"SteelWheelsSales\" catalog=\"SteelWheels\" schema=\"SteelWheels\"/></items>",
        applicationWadl);

  }


}

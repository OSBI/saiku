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


import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.util.exception.SaikuOlapException;

import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Pending;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

/**
 * Story for lookup_datasources.story
 */
class OlapDataSourceStepsdef {


  @Steps
  private
  DataSteps data;
  private List<SaikuConnection> connections;
  private SaikuConnection ds;

  @Pending
  @Given("a server has no available data sources")
  public void givenAServerHasNoAvailableDataSources() throws Exception {
    List<String> l = new ArrayList<String>();
    data.createDataSources(l);
    data.load();
  }

  @Pending
  @Given("There are $datasources data sources registered on the server")
  public void thereAreDataSourcesRegisteredOnTheServer(int datasources) throws Exception {
    List<String> l = new ArrayList<String>();
    l.add("test");
    l.add("foodmart");
    data.createDataSources(l);
    data.load();
  }

  @Pending
  @Given("The server has not yet been started")
  public void theServerHasNotYetBeenStarted() {

  }

  @Pending
  @Given("There aren't any data sources registered on the server")
  public void thereArentAnyDataSourcesRegistered() throws Throwable {
    data.createDataSources(null);
    data.load();
  }

  @Pending
  @Given("a null data source is configured in the server")
  public void givenANullDataSourceIsConfiguredInTheServer() {
    data.createDataSources(null);
  }


  @When("I load one data source")
  public void iLoadOneDataSource() throws Exception {
    List<String> l = new ArrayList<String>();
    l.add("foodmart");
    data.createDataSources(l);
    data.loadsingle();
    connections = data.getDatasources();
  }

  @When("I check all the available data sources")
  public void iCheckAllTheAvailableDataSources() throws SaikuOlapException {
    connections = data.getDatasources();
  }

  @When("I request a non existant data source")
  public void iRequestANonExistantDataSource() {

  }

  @When("I request the $name data source")
  public void iRequestTheFoodmartDataSource(String name) throws Throwable {
    ds = data.getConnection(name);
  }

  @When("an incorrect path is passed into the server")
  public void whenAnIncorrectPathIsPassedIntoTheServer() {
  }

  @When("the data source is loaded")
  public void whenTheDataSourceIsLoaded() {

  }

  @When("2 new data sources are passed into the server as a list")
  public void when2NewDataSourcesArePassedIntoTheServerAsAList() throws Exception {
    List<String> l = new ArrayList<String>();
    l.add("test");
    l.add("foodmart");

    data.addDataSources(l);
    data.loadNewDataSources();
  }

  @Pending
  @When("a user removes a data source")
  public void whenAUserRemoves1DataSource() {
    data.removeDatasource("foodmart");
  }

  @When("a user removes a data source with an incorrect name")
  public void whenAUserRemovesADataSourceWithAnIncorrectName() {
    data.removeDatasource("broken");
  }

  @Then("there will be $datasources data sources listed")
  public void thereWillBeSomeDataSourcesListed(int datasources) {
    assertThat(connections.size(), equalTo(datasources));
  }

  @Then("I will get the details for only the $name data source")
  public void iWillGetTheDetailsForOnlyTheRequestedDataSource(String name) {
    assertThat(ds.getName(), equalTo(name));
  }

  @Then("The server should fail gracefully")
  public void theServerShouldFailGracefully() throws SaikuOlapException {

    data.getInvalidDatasource("nonexistant");

  }

  @Then("the server should throw an exception")
  public void thenTheServerShouldThrowAnException() throws Exception {
    data.createInvalidDataSources();
  }

  @Then("a SaikuServiceException should be thrown")
  public void thenASaikuServiceExceptionShouldBeThrown() throws Exception {
    data.load();
  }

  @Then("the amount of data sources should equal 2")
  public void thenTheAmountOfDataSourcesShouldEqual2() throws SaikuOlapException {
    assertThat(data.getDatasources().size(), equalTo(2));
  }


  @Then("the server should have 1 remaining data sources")
  public void thenTheServerShouldHave1RemainingDataSources() throws SaikuOlapException {
    assertThat(data.getDatasources().size(), equalTo(1));
  }


}

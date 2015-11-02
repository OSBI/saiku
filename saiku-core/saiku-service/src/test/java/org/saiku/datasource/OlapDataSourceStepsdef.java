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
package org.saiku.datasource;


import net.thucydides.core.annotations.Steps;
import org.jbehave.core.annotations.*;
import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.util.exception.SaikuOlapException;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
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

  @Given("a server has no available data sources")
  public void givenAServerHasNoAvailableDataSources() throws Exception {
    List<String> l = new ArrayList<>();
    data.createDataSources(l);
    data.load();
  }

  @Given("There are $datasources data sources registered on the server")
  public void there_are_data_sources_registered_on_the_server( int datasources ) throws Exception {
    List<String> l = new ArrayList<>();
    l.add( "test" );
    l.add( "foodmart" );
    data.createDataSources(l);
    data.load();
    assertThat(data.getDatasources().size(), equalTo(2));
  }

  @Given("The server has not yet been started")
  public void the_server_has_not_yet_been_started() {

  }

  @Given("There aren't any data sources registered on the server")
  public void there_arent_any_data_sources_registered() throws Throwable {
    data.createDataSources( null );
    data.load();
  }

  @Given("a null data source is configured in the server")
  public void givenANullDataSourceIsConfiguredInTheServer() {
    data.createDataSources(null);
  }


  @When("I load one data source")
  public void i_load_one_data_source() throws Exception {
    List<String> l = new ArrayList<>();
    l.add( "foodmart" );
    data.createDataSources( l );
    data.loadsingle();
    connections = data.getDatasources();
  }

  @When("I check all the available data sources")
  public void i_check_all_the_available_data_sources() throws SaikuOlapException {
    connections = data.getDatasources();
  }

  @When("I request a non existant data source")
  public void i_request_a_non_existant_data_source() {

  }

  @When("I request the $name data source")
  public void i_request_the_foodmart_data_source( String name ) throws Throwable {
    ds = data.getConnection( name );
  }

  @When("an incorrect path is passed into the server")
  public void whenAnIncorrectPathIsPassedIntoTheServer() {
  }

  @When("the data source is loaded")
  public void whenTheDataSourceIsLoaded() {

  }

  @When("2 new data sources are passed into the server as a list")
  public void when2NewDataSourcesArePassedIntoTheServerAsAList() throws Exception {
    List<String> l = new ArrayList<>();
    l.add("test");
    l.add("foodmart");

    data.addDataSources(l);
    data.loadNewDataSources();
  }

  @When("a user removes a data source")
  public void whenAUserRemoves1DataSource() {
    assertThat(data.removeDatasource("foodmart"), is(true));
  }

  private Boolean state = null;
  @When("a user removes a non existing data source")
  public void whenAUserRemovesNonExistingDataSource() {
    state = data.removeDatasource("non-existing");
  }

  @When("a user removes a data source with an incorrect name")
  public void whenAUserRemovesADataSourceWithAnIncorrectName() {
    state = data.removeDatasource("broken");
  }

  @Then("there will be $datasources data sources listed")
  public void there_will_be_some_data_sources_listed( int datasources ) {
    assertThat( connections.size(), equalTo( datasources ) );
  }

  @Then("I will get the details for only the $name data source")
  public void i_will_get_the_details_for_only_the_requested_data_source( String name ) {
    assertThat( ds.getName(), equalTo( name ) );
  }

  @Then("The server should fail gracefully")
  public void the_server_should_fail_gracefully() {
    data.getInvalidDatasource( "nonexistant" );
  }

  @Then("the server should throw an exception")
  public void thenTheServerShouldThrowAnException() throws Exception {
    data.createInvalidDataSources();
  }

  @Then("the server should return unsuccessful state")
  public void thenTheServerShouldUnSuccessfulState() {
    assertThat(state, is(false));
  }

  @Then("a SaikuServiceException should be thrown")
  public void thenASaikuServiceExceptionShouldBeThrown() throws Exception {
    data.load();
  }

  @Then("the amount of data sources should equal 2")
  public void thenTheAmountOfDataSourcesShouldEqual2() throws SaikuOlapException {
    assertThat( data.getDatasources().size(), equalTo( 2 ) );
  }


  @Then("the server should have 1 remaining data sources")
  public void thenTheServerShouldHave1RemainingDataSources() throws SaikuOlapException {
    assertThat( data.getDatasources().size(), equalTo( 1 ) );
  }


}

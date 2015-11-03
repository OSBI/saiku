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
package org.saiku;

import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Pending;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;

/**
 * Created by bugg on 02/05/14.
 */
class OlapCubeStepsDef {
  @Pending
  @Given("A user has a list of valid data sources")
  public void a_user_has_a_list_of_valid_data_sources() {
    // Write code here that turns the phrase above into concrete actions

  }
  @Pending
  @When("A user selects a data source")
  public void a_user_selects_a_data_source() {
    // Write code here that turns the phrase above into concrete actions
  }

  @Pending
  @Then("It should return a list of available cubes")
  public void it_should_return_a_list_of_available_cubes() {
    // Write code here that turns the phrase above into concrete actions
  }

  @Pending
  @When("A user selects an invalid data source")
  public void a_user_selects_and_invalid_data_source() {
    // Write code here that turns the phrase above into concrete actions
  }

  @Pending
  @Then("It should fail gracefully")
  public void it_should_fail_gracefully() {
    // Write code here that turns the phrase above into concrete actions
  }

  @Pending
  @Then("there will be $cubes cubes listed")
  public void there_will_be_data_sources_listed(int cubes) {
    // Write code here that turns the phrase above into concrete actions
  }
}

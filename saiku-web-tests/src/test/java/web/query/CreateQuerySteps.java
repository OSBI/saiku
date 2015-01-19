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

package web.query;

import bi.meteorite.steps.UserSteps;

import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;
import org.jbehave.core.model.ExamplesTable;

/**
 * Created by bugg on 16/01/15.
 */
public class CreateQuerySteps {

  @Steps
  UserSteps steps;


  @Given("a server user '$user' with password '$password' has logged in")
  public void givenAServerUseradminHasLoggedInto(String user, String password) {
    steps.is_the_home_page();
    steps.logsin(user, password);
  }

  @When("a new query is created")
  public void whenANewQueryIsCreated() {
    steps.createquery();
  }

  @When("the cube '$cube' is selected")
  public void whenTheCubeSalesIsSelected(String cube) {
    steps.selectCube(cube);
  }

  @When("the measure '$measure' is placed in measures")
  public void whenTheMeasureStoreSalesIsPlacedInMeasures(String measure) {
    steps.click_link(measure, false);
  }

  @When("the level '$level' from the '$dimension' dimension is placed on rows")
  public void whenTheLevelProductFamilyIsPlacedOnRows(String level, String dimension) {
    steps.click_link(dimension, false);
    steps.click_link(level, true);
  }

  @Then("a result set is returned: $table")
  public void thenAResultSetIsReturned(ExamplesTable table) {
    steps.compareTable(table);
  }

}

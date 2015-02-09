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

package web.query.filter;

import bi.meteorite.steps.UserSteps;

import net.thucydides.core.annotations.Pending;
import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;

/**
 * Created by bugg on 16/01/15.
 */
public class CreateQuerySteps {

  @Steps
  UserSteps steps;

  @Given("a server user 'admin' with password 'admin' has logged in")
  @Pending
  public void givenAServerUseradminWithPasswordadminHasLoggedIn() {
    // PENDING
  }

  @When("a new query is created")
  @Pending
  public void whenANewQueryIsCreated() {
    // PENDING
  }

  @When("the cube 'Sales' is selected")
  @Pending
  public void whenTheCubeSalesIsSelected() {
    // PENDING
  }

  @When("the measure 'Store Sales' is placed in measures")
  @Pending
  public void whenTheMeasureStoreSalesIsPlacedInMeasures() {
    // PENDING
  }

  @When("the level 'Product Family' from the 'Product' dimension is placed on rows")
  @Pending
  public void whenTheLevelProductFamilyFromTheProductDimensionIsPlacedOnRows() {
    // PENDING
  }

  @Then("a result set is returned:\r\n|Product Family|Store Sales|\r\n|Drink|48,836.21|\r\n|Food|409,027.49|\r\n|Non-Consumable|107,366.33|")
  @Pending
  public void thenAResultSetIsReturnedProductFamilyStoreSalesDrink4883621Food40902749NonConsumable10736633() {
    // PENDING
  }

  @Then("the 'Product Family' level is selected")
  @Pending
  public void thenTheProductFamilyLevelIsSelected() {
    // PENDING
  }

  @Then("Food is moved to the filter area\r\nThe okay button is then pressed")
  @Pending
  public void thenFoodIsMovedToTheFilterAreaTheOkayButtonIsThenPressed() {
    // PENDING
  }

  @Then("a result set is returned:\r\n|Product Family|Store Sales|\r\n|Food|409,027.49|")
  @Pending
  public void thenAResultSetIsReturnedProductFamilyStoreSalesFood40902749() {
    // PENDING
  }

}

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

package web.repopermissions;

import bi.meteorite.steps.UserSteps;

import net.thucydides.core.annotations.Pending;
import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;

/**
 * Created by bugg on 16/01/15.
 */
public class RepoSteps {

  @Steps
  UserSteps steps;

  @When("save it to their home directory as 'test.saiku'")
  @Pending
  public void whenSaveItToTheirHomeDirectoryAstestsaiku() {
    // PENDING
  }

  @Then("they should be able to reopen the query they have saved as 'test.saiku'")
  @Pending
  public void thenTheyShouldBeAbleToReopenTheQueryTheyHaveSavedAstestsaiku() {
    // PENDING
  }

  @Given("a working server as admin I would like to be able to run a Saiku query and save it to a public directory and other users should be able to access the query")
  @Pending
  public void givenAWorkingServerAsAdminIWouldLikeToBeAbleToRunASaikuQueryAndSaveItToAPublicDirectoryAndOtherUsersShouldBeAbleToAccessTheQuery() {
    // PENDING
  }

  @Given("a working server as admin I would like to be able to run a Saiku query and save it to a public directory but set the permissions to private and other users should not be able to access the query")
  @Pending
  public void givenAWorkingServerAsAdminIWouldLikeToBeAbleToRunASaikuQueryAndSaveItToAPublicDirectoryButSetThePermissionsToPrivateAndOtherUsersShouldNotBeAbleToAccessTheQuery() {
    // PENDING
  }

  @Then("user 'admin' will set the query file to private")
  @Pending
  public void thenUseradminWillSetTheQueryFileToPrivate() {
    // PENDING
  }


  @Given("a working server as admin I would like to be able to run a Saiku query and save it to a public directory but set the permissions to so only admin and joe can access the report")
  @Pending
  public void givenAWorkingServerAsAdminIWouldLikeToBeAbleToRunASaikuQueryAndSaveItToAPublicDirectoryButSetThePermissionsToSoOnlyAdminAndJoeCanAccessTheReport() {
    // PENDING
  }

  @Given("a server user 'admin' with password 'admin' has logged in")
  @Pending
  public void givenAServerUseradminWithPasswordadminHasLoggedIn() {
    // PENDING
  }

  @When("they create a new query")
  @Pending
  public void whenTheyCreateANewQuery() {
    // PENDING
  }

  @When("save it to the directory 'public'")
  @Pending
  public void whenSaveItToTheDirectorypublic() {
    // PENDING
  }

  @Then("user 'admin' will set the query file so only user 'admin' and user 'joe' have access")
  @Pending
  public void thenUseradminWillSetTheQueryFileSoOnlyUseradminAndUserjoeHaveAccess() {
    // PENDING
  }

  @Then("they should be able to reopen the query they have saved")
  @Pending
  public void thenTheyShouldBeAbleToReopenTheQueryTheyHaveSaved() {
    // PENDING
  }

  @Then("user 'admin' should logout")
  @Pending
  public void thenUseradminShouldLogout() {
    // PENDING
  }

  @Then("user 'joe' with password 'password' will login")
  @Pending
  public void thenUserjoeWithPasswordpasswordWillLogin() {
    // PENDING
  }

  @Then("try and open the query saved as 'test.saiku'")
  @Pending
  public void thenTryAndOpenTheQuerySavedAstestsaiku() {
    // PENDING
  }

  @Then("saiku should open the query")
  @Pending
  public void thenSaikuShouldOpenTheQuery() {
    // PENDING
  }

  @Then("user 'joe' should logout")
  @Pending
  public void thenUserjoeShouldLogout() {
    // PENDING
  }

  @Then("user 'susan' with password 'password' will login")
  @Pending
  public void thenUsersusanWithPasswordpasswordWillLogin() {
    // PENDING
  }

  @Then("saiku should not open the query")
  @Pending
  public void thenSaikuShouldNotOpenTheQuery() {
    // PENDING
  }

}

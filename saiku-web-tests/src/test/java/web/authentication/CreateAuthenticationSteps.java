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

package web.authentication;

import bi.meteorite.steps.UserSteps;

import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.*;

/**
 * Created by bugg on 15/01/15.
 */
public class CreateAuthenticationSteps {


  @Steps
  UserSteps steps;

  @Given("there is a default Saiku server")
  public void givenThereIsADefaultSaikuServer() {
    steps.is_the_home_page();
  }

  @When("user '$user' passes their details '$password' to the login form")
  public void whenAdminPassesTheirDetailsToTheLoginForm(String user, String password) {
    steps.logsin(user, password);
  }

  @Then("the server should process the information and log them in")
  public void thenTheServerShouldProcessTheInformationAndLogThemIn() {
    steps.user_should_see_splashscreen();
  }

  @When("user '$user' passes an invalid username to the server")
  public void whenAdminPassesAnInvalidUsernameToTheServer(String user) {
    steps.logsin(user, "admin");
    steps.user_should_not_see_splashscreen();

  }

  @When("user '$user' passes an incorrect password '$password' to the server")
  public void whenAdminPassesAnIncorrectPasswordToTheServer(String user, String password) {
    steps.logsin(user, password);
    steps.user_should_not_see_splashscreen();
  }

  @Then("'$definition' should be displayed")
  public void thenAnErrorMessageShouldBeDisplayed(String definition) {
    steps.dialogErrorMessage(definition);
  }

}

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

package web.authentication.logout;

import bi.meteorite.steps.UserSteps;

import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.BeforeScenario;
import org.jbehave.core.annotations.Given;
import org.jbehave.core.annotations.Then;
import org.jbehave.core.annotations.When;

/**
 * Created by bugg on 15/01/15.
 */
public class CreateAuthenticationSteps {


  @Steps
  UserSteps steps;

  @Given("a server user '$user' with password '$password' has logged in")
  public void givenThereIsADefaultSaikuServer(String user, String password) {
    steps.is_the_home_page();
    steps.logsin(user, password);
  }

  @When("they press the logout button")
  public void whenUserPressesLogoutButton() {
    try {
      Thread.sleep(10000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    steps.click_link_by_id("logout", true);
  }

  @Then("Saiku should display the login form")
  public void thenTheServerShouldProcessTheInformationAndLogThemIn() {
    steps.user_should_see_login();
  }

  @BeforeScenario()
  public void clearCookies(){
    steps.getDriver().manage().deleteAllCookies();
  }
}

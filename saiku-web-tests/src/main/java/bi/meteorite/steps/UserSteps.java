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

package bi.meteorite.steps;

import bi.meteorite.pages.LoginPage;

import net.thucydides.core.annotations.Step;

import org.jbehave.core.model.ExamplesTable;
import org.openqa.selenium.WebDriver;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by bugg on 16/01/15.
 */
public class UserSteps {

  LoginPage login;

  @Step
  public void enters_username(String username) {
    login.enter_username(username);
  }

  @Step
  public void enters_password(String password) {
    login.enter_password(password);
  }

  @Step
  public void attempts_login(){
    login.click_login();
  }

  @Step
  public void is_the_home_page() {
    login.open();
  }

  @Step
  public void logsin(String u, String p){
    login.enter_username(u);
    login.enter_password(p);
    login.click_login();
  }

  @Step
  public void user_should_see_splashscreen() {
    assertThat(login.getNewQueryButton().isDisplayed(), is(true));
  }


  @Step
  public void user_should_not_see_splashscreen() {
    assertThat(login.findByID("new_query").isEmpty(), is(true));
  }

  @Step
  public void dialogErrorMessage(String message){
    login.getDriver().manage().timeouts().implicitlyWait(2, TimeUnit.SECONDS);
    assertThat(login.findByXPath("//*[@id=\"ui-id-3\"]/div[3]/div").get(0).getText(), equalTo(message));
  }



  public WebDriver getDriver(){
    return login.getDriver();
  }

  @Step
  public void createquery() {

    login.click_new_query();
  }

  @Step
  public void selectCube(String cube) {
    login.selectCube(cube);
  }

  @Step
  public void click_link(String text, boolean wait) {
    login.findByLinkText(text).get(0).click();
    if(wait) {
      login.getDriver().manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
    }

  }

  @Step
  public void click_link_by_id(String id, boolean wait){
    login.findByID(id).get(0).click();
    if(wait) {
      login.getDriver().manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);
    }
  }

  @Step
  public void compareTable(ExamplesTable table){
    List<Map<Object, String>> t = login.getResultTable();

    List<Map<String, String>> example = table.getRows();

    assertThat(t.get(1).get("Store Sales"), equalTo(example.get(0).get("Store Sales")));



  }

  @Step
  public void closeTab(int i){

    login.close_tab(i);
  }

  public void user_should_see_login() {
    assertThat(login.findByID("username").get(0).isDisplayed(), is(true));
  }
}

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

package bi.meteorite.pages;

import net.thucydides.core.annotations.DefaultUrl;
import net.thucydides.core.annotations.findby.By;
import net.thucydides.core.annotations.findby.FindBy;
import net.thucydides.core.pages.PageObject;
import net.thucydides.core.pages.WebElementFacade;

import org.openqa.selenium.WebElement;

import java.util.List;

import ch.lambdaj.function.convert.Converter;

/**
 * Created by bugg on 15/01/15.
 */
@DefaultUrl("http://localhost:9999")
public class LoginPage extends PageObject {

  @FindBy(name="username")
  private WebElementFacade username;

  @FindBy(name="password")
  private WebElementFacade password;

  @FindBy(xpath="//*[@id=\"ui-id-1\"]/div[3]/a")
  private WebElementFacade loginbutton;

  @FindBy(id="new_query")
  private WebElementFacade new_query_button;

  @FindBy(className = "dialog_response")
  private WebElementFacade dialog_response;

  public void enter_username(String keyword) {
    username.type(keyword);
  }

  public void enter_password(String keyword) {
    password.type(keyword);
  }

  public void click_login(){
    loginbutton.click();
  }

  public WebElementFacade getNewQueryButton() {
    return new_query_button;
  }

  public List<WebElement> findByID(String id){
    return this.getDriver().findElements(By.id(id));
  }

  public List<WebElement> findByClass(String classn){
    return this.getDriver().findElements(org.openqa.selenium.By.className(classn));
  }

  public List<WebElement> findByXPath(String xpath){
    return this.getDriver().findElements(org.openqa.selenium.By.xpath(xpath));
  }

  public String getDialog_Response() {
    return dialog_response.getText();
  }

  private Converter<WebElement, String> toStrings() {
    return new Converter<WebElement, String>() {
      public String convert(WebElement from) {
        return from.getText();
      }
    };
  }
}

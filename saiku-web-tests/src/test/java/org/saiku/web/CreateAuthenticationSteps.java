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

package org.saiku.web;

import net.thucydides.core.annotations.Steps;

import org.jbehave.core.annotations.Given;

/**
 * Created by bugg on 15/01/15.
 */
public class CreateAuthenticationSteps {

  @Steps
  DataSteps data = new DataSteps();


  @Given("a valid username and password a user should be able to login to the Saiku server")
  public void givenThereIsAFoodmartInstanceAvailable() {
    try {
      //data.load();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}

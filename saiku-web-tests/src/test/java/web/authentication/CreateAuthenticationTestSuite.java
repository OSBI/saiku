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

import net.thucydides.core.ThucydidesSystemProperty;
import net.thucydides.jbehave.ThucydidesJBehave;
import net.thucydides.jbehave.ThucydidesJUnitStories;

import org.jbehave.core.configuration.Configuration;
import org.jbehave.core.reporters.Format;
import org.jbehave.core.steps.InjectableStepsFactory;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import web.JiraStoryLoader;

/**
 * Created by bugg on 15/01/15.
 */
public class CreateAuthenticationTestSuite extends ThucydidesJUnitStories {




  public LinkedList<Object> stepDefinitions = new LinkedList<Object>();
  @Override
  public Configuration configuration() {

    net.thucydides.core.webdriver.Configuration thucydidesConfiguration = getSystemConfiguration();

    List<Format> formats = Arrays.asList(Format.CONSOLE, Format.HTML, Format.XML, Format.TXT);

    Configuration configuration = ThucydidesJBehave.defaultConfiguration(thucydidesConfiguration, formats, this);


    return configuration
        .useStoryLoader(new JiraStoryLoader("SUT-2"));
  }
  @Override
  public InjectableStepsFactory stepsFactory() {
    return SaikuStepFactory.withStepsFromPackage(this.stepDefinitions, configuration()).andClassLoader(getClassLoader
        ());
  }
  public CreateAuthenticationTestSuite() {
    System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");
    getSystemConfiguration().setIfUndefined("webdriver.driver", "chrome");
    getSystemConfiguration()
        .setIfUndefined(ThucydidesSystemProperty.THUCYDIDES_STORE_HTML_SOURCE.getPropertyName(), "true");
    getSystemConfiguration()
        .setIfUndefined(ThucydidesSystemProperty.THUCYDIDES_TAKE_SCREENSHOTS.getPropertyName(), "FOR_FAILURES");

    this.stepDefinitions.add(new CreateAuthenticationSteps());
  //  this.stepDefinitions.add(new DataSteps());
  }


}
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

package web;

import net.serenitybdd.jbehave.SerenityJBehave;
import net.thucydides.jbehave.ThucydidesJUnitStories;

import org.jbehave.core.configuration.Configuration;
import org.jbehave.core.reporters.Format;
import org.jbehave.core.steps.InjectableStepsFactory;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import web.utils.SaikuStepFactory;

/**
 * Created by bugg on 16/01/15.
 */
public abstract class AbstractTestSuite extends ThucydidesJUnitStories {

  public LinkedList<Object> stepDefinitions = new LinkedList<Object>();
  public String jiraid = "";
  @Override
  public Configuration configuration() {

    net.thucydides.core.webdriver.Configuration thucydidesConfiguration = getSystemConfiguration();

    List<Format> formats = Arrays.asList(Format.CONSOLE, Format.HTML, Format.XML, Format.TXT);

    Configuration configuration = SerenityJBehave.defaultConfiguration(thucydidesConfiguration, formats, this);


    return configuration
        .useStoryLoader(new JiraStoryLoader(jiraid));
  }
  @Override
  public InjectableStepsFactory stepsFactory() {
    return SaikuStepFactory.withStepsFromPackage(this.stepDefinitions, configuration()).andClassLoader(getClassLoader
        ());
  }
  public AbstractTestSuite() {
   //System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");
    //getSystemConfiguration().setIfUndefined("webdriver.driver", "chrome");
    getSystemConfiguration()
        .setIfUndefined("serenity.store.html.source", "true");
    getSystemConfiguration()
        .setIfUndefined("serenity.take.screenshots", "AFTER_EACH_STEP");
    getSystemConfiguration().setIfUndefined("serenity.restart.browser.frequency", "1");

  }


}

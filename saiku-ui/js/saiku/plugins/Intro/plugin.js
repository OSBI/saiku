/*
 *   Copyright 2017 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Step-by-step guide and feature introduction
 *
 * @example
 *
 *    @param {String}       fileName         - Filename json
 *    @param {String|Array} specificElements - Specific elements to make the steps
 *    @param {Object}       options          - Intro.js plugin options
 *
 *    Saiku.intro.start('Workspace', ['#new_query', '#admin_icon'], { showProgress: false });
 *
 *    or
 *
 *    Saiku.intro.start('Workspace');
 */
Saiku.intro = {
  intro: introJs(),

  fileName: Settings.INTRO_FILE_NAME || 'Workspace',

  get_specific_elements: function(data, specificElements) {
    var steps = data.steps;
    var newSteps = {};

    newSteps.steps = [];

    if (_.isString(specificElements)) {
      _.find(steps, function(value) {
        if (value.element === specificElements) {
          newSteps.steps.push(value);
        }
      });
    }
    else if (_.isArray(specificElements)) {
      var iSteps = 0;
      var iElems = 0;

      do {
        if (steps[iSteps].element === specificElements[iElems]) {
          newSteps.steps.push(steps[iSteps]);
          iSteps = 0;
          iElems += 1;
        }
        else {
          iSteps += 1;
        }
      } while (iElems < specificElements.length);

      if (newSteps.steps.length === 0) {
        newSteps = data;
      }
    }
    else {
      newSteps = data;
    }

    return newSteps;
  },

  merge_options: function(options) {
    var newOptions = Settings.INTRO_DEFAULT_OPTIONS;

    $.extend(newOptions, options);
    this.intro.setOptions(newOptions);
  },

  start: function(fileName, specificElements, options) {
    var self = this;

    if (fileName) {
      this.fileName = fileName;
    }

    $.ajax({
      url: 'js/saiku/plugins/Intro/steps/' + self.fileName + '.json',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        if (specificElements) {
          data = self.get_specific_elements(data, specificElements);
        }

        if (options) {
          self.merge_options(options);
        }
        else {
          self.intro.setOptions(Settings.INTRO_DEFAULT_OPTIONS);
        }

        self.intro.setOptions(data);
        self.intro.start();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error(jqXHR);
        console.error(textStatus);
        console.error(errorThrown);
      }
    });
  }
};

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

/**
 * The "about us" dialog
 */
var TitlesModal = Modal.extend({
    type: 'info',

    buttons: [
        { text: 'Okay', method: 'okay' },
        { text: 'Cancel', method: 'close' }
    ],

    message: _.template("<form id='login_form'>" +
        "<label for='title' class='i18n'>Title</label>" +
        "<input type='text' id='title' name='title' value='' />" +
        "<label for='variable' class='i18n'>Variable</label>" +
        "<input type='text' id='variable' name='variable' value='' />" +
        "<label for='explanation' class='i18n'>Explanation</label>" +
        "<input type='text' id='explanation' name='explanation' value='' />" +
        "</form>")(),

    initialize: function(args) {
        this.options.title = 'Report Titles';
        this.query = args.query;
    },

    close: function(event) {
        if (event.target.hash === '#close') {
            event.preventDefault();
        }

        this.$el.dialog('destroy').remove();
    },

    okay: function(event) {
        event.preventDefault();
        var headings ={title: $(this.el).find("#title").val(),
            variable: $(this.el).find("#variable").val(),
            explanation: $(this.el).find("#explanation").val()};
        var j = JSON.stringify(headings);
        this.query.setProperty("saiku.ui.headings", j);
        this.query.run(true);


        this.$el.dialog('destroy').remove();
    }
});

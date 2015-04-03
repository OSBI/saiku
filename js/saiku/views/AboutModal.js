/*
 *   Copyright 2012 OSBI Ltd
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
 * The "about us" dialog
 */
var AboutModal = Modal.extend({
    type: 'info',

    events: {
        'click a' : 'close'
    },

    message: Settings.VERSION + '<br>' +
        '<a href="http://saiku.meteorite.bi" target="_blank">http://saiku.meteorite.bi</a><br><br>' +
        '<a href="http://wiki.meteorite.bi/display/SAIK/Saiku+Documentation" target="_blank">Saiku Wiki online help</a><br><br>' +
        'Powered by <img src="images/src/meteorite_free.png" width="20px"> <a href="http://www.meteorite.bi/consulting/" target="_blank">www.meteorite.bi</a>',

    initialize: function() {
        this.options.title = 'About ' + Settings.VERSION;
    },

    close: function(event) {
        if (event.target.hash === '#close') {
            event.preventDefault();
        }
        this.$el.dialog('destroy').remove();
    }
});

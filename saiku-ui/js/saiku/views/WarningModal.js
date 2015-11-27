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
var WarningModal = Modal.extend({
    type: 'info',

    buttons: [
        { text: 'Okay', method: 'okay' },
        { text: 'Cancel', method: 'close' }
    ],
    /*message: Settings.VERSION + '<br>' +
        '<a href="http://saiku.meteorite.bi" target="_blank">http://saiku.meteorite.bi</a><br><br>' +
        'Powered by <img src="images/src/meteorite_free.png" width="20px"> <a href="http://www.meteorite.bi/consulting/" target="_blank">www.meteorite.bi</a>',*/

    initialize: function(args) {
        this.options.title = args.title;
        this.message = '<span class="i18n">' + args.message + '</span>';
        this.cancelfunction = args.cancel;
        this.okayfunction = args.okay;
        this.okaycallbackobject = args.okayobj;
        this.cancelcallbackobject = args.cancelobj;
    },

    close: function(event) {
        if (event.target.hash === '#close') {
            event.preventDefault();
        }
        if(this.cancelfunction != null) {
            this.cancelfunction(this.cancelcallbackobject);
        }
        this.$el.dialog('destroy').remove();
    },

    okay: function(event) {
        event.preventDefault();
        if(this.okayfunction!=null) {
            this.okayfunction(this.okaycallbackobject);
        }

        this.$el.dialog('destroy').remove();
    }

});

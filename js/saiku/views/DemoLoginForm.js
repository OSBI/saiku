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
 * The login prompt on startup
 */
var DemoLoginForm = Modal.extend({
    type: "login",
    message: "<form id='demo_form'>" +
        "<label for='email'>Email:</label>" +
        "<input type='text' id='email' name='email' value='' />" +
        "</form>",
        
    buttons: [
        { text: "Start Demo", method: "login" }
    ],
    
    events: {
        'click a': 'call',
        'keyup #demo_form input': 'check'
    },
    
    initialize: function(args) {
        _.extend(this, args);
        _.bindAll(this, "adjust");
        this.options.title = Settings.VERSION;
        this.bind('open', this.adjust);
    },
    
    adjust: function() {
        $(this.el).parent().find('.ui-dialog-titlebar-close').hide();
        $(this.el).find("#email").select().focus();
    },
    
    check: function(event) {
        if(event.which === 13) {
            this.login();
        }
    },
    
    login: function() {
        
        var l_username = Settings.USERNAME;
        var l_password = Settings.PASSWORD;
        var email = $(this.el).find("#email").val();

        if (email) {
            window.Intercom('boot', {
                        email: email,
                        created_at:  Math.round((new Date()).getTime() / 1000),
                        app_id: "597eb390acd63f51158efafc191ef490defb8bdd",
                        widget: {activator: '#IntercomDefaultWidget'}
              }
            );
            $(this.el).dialog('close');
            this.session.login(l_username, l_password);
        }

        return true;
    }
});

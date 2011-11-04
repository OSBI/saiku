/*
 * LoginForm.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
/**
 * The login prompt on startup
 */
var LoginForm = Modal.extend({
    type: "login",
    message: "<form id='login_form'>" +
        "<label for='username'>Username</label><br />" +
        "<input type='text' id='username' name='username' value='' /><br />" +
        "<label for='password'>Password</label><br />" +
        "<input type='password' id='password' name='password' value='' />" +
        "</form>",
        
    buttons: [
        { text: "Login", method: "login" }
    ],
    
    events: {
        'click a': 'call',
        'keyup #login_form input': 'check'
    },
    
    initialize: function(args) {
        _.extend(this, args);
        _.bindAll(this, "adjust");
        this.options.title = Settings.VERSION;
        this.bind('open', this.adjust);
    },
    
    adjust: function() {
        $(this.el).parent().find('.ui-dialog-titlebar-close').hide();
        $(this.el).find("#username").select().focus();
    },
    
    check: function(event) {
        if(event.which === 13) {
            this.login();
        }
    },
    
    login: function() {
        
        var l_username = $(this.el).find("#username").val();
        var l_password = $(this.el).find("#password").val();
        $(this.el).dialog('close');
        this.session.login(l_username, l_password);

        return true;
    }
});

/*
 * Session.js
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
 * Object which handles authentication and stores connections and cubes
 * @param username
 * @param password
 * @returns {Session}
 */
var Session = Backbone.Model.extend({
    username: null,
    password: null,
    sessionid: null,
        
    initialize: function(args, options) {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "check_session", "process_session", "load_session","login");
        // Check if credentials are being injected into session
        if (options && options.username && options.password) {
            this.username = options.username;
            this.password = options.password;
            this.save({username:this.username, password:this.password},{success: this.check_session, error: this.check_session});

        } else {
            this.check_session();
        }
    },

    check_session: function() {
        if (this.sessionid === null || this.username === null || this.password === null) {
            this.clear();
            this.fetch({ success: this.process_session })
        } else {
            this.username = encodeURIComponent(options.username);
            this.load_session();
        }
    },

    load_session: function() {
        this.sessionworkspace = new SessionWorkspace();
    },

    process_session: function(model, response) {
        if ((response === null || response.sessionid == null)) {
            // Open form and retrieve credentials
            Saiku.ui.unblock();
            this.form = new LoginForm({ session: this });
            this.form.render().open();
        } else {
            this.sessionid = response.sessionid;
            this.roles = response.roles;
            this.username = encodeURIComponent(response.username);
            this.load_session();
        }
        
        return this;
    },
    
    error: function() {
        $(this.form.el).dialog('open');
    },
    
    login: function(username, password) {
        // Set expiration on localStorage to one day in the future
        var expires = (new Date()).getTime() + 
            Settings.LOCALSTORAGE_EXPIRATION;
        localStorage && localStorage.setItem('expiration', expires);

        this.save({username:username, password:password},{success: this.check_session, error: this.check_session});
        
    },
    
    logout: function() {
        // FIXME - This is a hack (inherited from old UI)
        Saiku.ui.unblock();
        $('#header').empty().hide();
        $('#tab_panel').remove();

        Saiku.toolbar = new Toolbar();
        localStorage && localStorage.clear();
        this.id = _.uniqueId('queryaction_');
        this.clear();
        this.sessionid = null;
        this.username = null;
        this.password = null;
        this.destroy({success:this.check_session, error:this.check_session});
        delete this.id;

    },

    url: function() {

        return "session";
    }
});

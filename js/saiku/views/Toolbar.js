/*
 * Toolbar.js
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
 * The global toolbar
 */
var Toolbar = Backbone.View.extend({
    tagName: "div",
    
    events: {
        'click #new_query': 'new_query',
        'click #open_query': 'open_query',
        'click #logout': 'logout',
        'click #about': 'about',
        'click #issue_tracker': 'issue_tracker'
    },
    
    template: function() {
        return _.template("<ul>" + 
                    "<li><a id='new_query' href='#new_query' title='New query' class='new_tab i18n sprite'></a></li>" +
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='open_query' href='#open_query' title='Open query' class='open_query i18n sprite'></a></li>" + 
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='logout' href='#logout' title='Logout' class='logout i18n sprite'></a></li>" +
                    "<li><a id='about' href='#about' title='About' class='about i18n sprite'></a></li>" +
                    "<li class='separator'>&nbsp;</li>" +
                    "<li><a id='issue_tracker' href='#issue_tracker' title='Issue Tracker' class='bug i18n sprite'></a></li>" +
                "</ul>" +
                "<h1 id='logo'><a href='http://www.analytical-labs.com/' title='Saiku - Next Generation Open Source Analytics' class='sprite'>Saiku</a></h1>"
            )(this);
    },
    
    initialize: function() {
        this.render();
    },
    
    render: function() {
        $(this.el).attr('id', 'toolbar')
            .html(this.template());
        
        // Trigger render event on toolbar so plugins can register buttons
        Saiku.events.trigger('toolbar:render', { toolbar: this });
        
        return this;
    },
    
    /**
     * Add a new tab to the interface
     */
    new_query: function() {
        Saiku.tabs.add(new Workspace());
        return false;
    },
    
    /**
     * Open a query from the repository into a new tab
     */
    open_query: function() {
        var dialog = _.detect(Saiku.tabs._tabs, function(tab) {
            return tab.content instanceof OpenQuery;
        });
        
        if (dialog) {
            dialog.select();
        } else {
            Saiku.tabs.add(new OpenQuery());
        }
        
        return false;
    },
    
    /**
     * Clear the current session and show the login window
     */
    logout: function() {
        Saiku.session.logout();
    },
    
    /**
     * Show the credits dialog
     */
    about: function() {
        (new AboutModal).render().open();
        return false;
    },
    
    /**
     * Go to the issue tracker
     */
    issue_tracker: function() {
        window.open('https://github.com/OSBI/saiku/issues/new');
        return false;
    }
});

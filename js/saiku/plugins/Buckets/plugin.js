/*
 * plugin.js
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
 * Allow the creation of buckets for queries
 */
var Buckets = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Create a unique ID for use as the CSS selector
        this.id = _.uniqueId("buckets_");
        $(this.el).attr({ id: this.id });
        
        // Bind table rendering to query result event
        _.bindAll(this, "render",  "show",  "setOptions");
        
        // Add buckets button
        this.add_button();
        this.workspace.toolbar.buckets = this.show;
        
        // Listen to adjust event and rerender buckets
        this.workspace.bind('workspace:adjust', this.render);
        
        $(this.workspace.el).find('.workspace_results')
            .prepend($(this.el).hide())
    },
    
    add_button: function() {
        var $stats_button = 
            $('<a href="#buckets" class="buckets button disabled_toolbar i18n" title="Buckets">Tag</a>')
            .css({ 'background': 
                "url('js/saiku/plugins/Buckets/xxx.png') 30% 30% no-repeat" });
        var $stats_li = $('<li class="seperator"></li>').append($stats_button);
        $(this.workspace.toolbar.el).find("ul").append($stats_li);
    },
    
    show: function(event, ui) {
        // $(this.workspace.el).find('.workspace_results table').toggle();
        $(this.el).toggle();
        $(event.target).toggleClass('on');
        
        if ($(event.target).hasClass('on')) {
            this.render();
        }
    },
    
    setOptions: function(event) {
        var type = $(event.target).attr('href').replace('#', '');
        try {
            alert("setOptions");
            this[type]();
        } catch (e) { }
        
        return false;
    },
    
    render: function() {
        if (! $(this.workspace.toolbar.el).find('.buckets').hasClass('on')) {
            return;
        }

        $(this.el).empty()
        var $table = $("<div class='buckets'>" +
                "<a href='#Bad Customers' class='i18n'>Bad Customers</a>" +
                "<a href='#Good Customers' class='i18n'>Good Customers</a>" +
                "<a href='#I like Pies' class='i18n'>I like Pies</a>" +
                "</div>").css({
                    'padding-bottom': '10px'
                });
        $table.find('a').css({ 
                    'color': '#666', 
                    'margin-right': '5px', 
                    'text-decoration': 'none', 
                    'border': '1px solid #ccc', 
                    padding: '5px' 
                }).click(function(event) {
                    if ($(event.target).hasClass('on')) {
                        $(event.target).removeClass('on').css({
                            'background' : 'white'
                        });
                    }
                    else {
                        $(event.target).addClass('on').css({
                            'background' : 'lightblue'
                        });
                    }
                        
                });
    
        $(this.el).append($table)
        
    }
    
});

/**
 * Start Plugin
 */ 
 Saiku.events.bind('session:new', function(session) {

        function new_workspace(args) {
            // Add stats element
            if (typeof args.workspace.buckets == "undefined") {
                args.workspace.buckets = new Buckets({ workspace: args.workspace });
            }
        }
        
        // Attach stats to existing tabs
        for(var i = 0; i < Saiku.tabs._tabs.length; i++) {
            var tab = Saiku.tabs._tabs[i];
            new_workspace({
                workspace: tab.content
            });
        };

        // Attach stats to future tabs
        Saiku.session.bind("workspace:new", new_workspace);
    });


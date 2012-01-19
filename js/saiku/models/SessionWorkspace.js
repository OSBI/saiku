/*
 * SessionWorkspace.js
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
 * Object which handles sessionworkspace and stores connections and cubes
 * @param username
 * @param password
 * @returns {Session}
 */
var SessionWorkspace = Backbone.Model.extend({
        
    initialize: function(args, options) {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "process_datasources", "prefetch_dimensions");
        this.initialized = false;
        this.first = true;
        // Check expiration on localStorage
        if (localStorage && ! (localStorage.getItem('expiration') > (new Date()).getTime())) {
            localStorage.clear();
        }
        Saiku.ui.block("Loading datasources....");
        this.fetch({success:this.process_datasources},{});
        
    },

    refresh: function() {
        localStorage.clear();
        this.clear();
        this.fetch({success:this.process_datasources},{});
    },
        
    destroy: function() {
        localStorage && localStorage.clear();
        return false;
    },
    
    process_datasources: function(model, response) {
        // Save session in localStorage for other tabs to use
        if (localStorage && localStorage.getItem('session') === null) {
            localStorage.setItem('session', JSON.stringify(response));
        }

        // Generate cube navigation for reuse
        this.cube_navigation = _.template($("#template-cubes").html())({
            connections: response
        });
        
        
        // Create cube objects
        this.dimensions = {};
        this.measures = {};
        this.connections = response;
        _.delay(this.prefetch_dimensions, 200);
        
        if (!this.initialized) {
            // Show UI
            $(Saiku.toolbar.el).prependTo($("#header"));
            $("#header").show();
            Saiku.ui.unblock();
            // Add initial tab
            Saiku.tabs.render();
            if (! Settings.ACTION) {
                Saiku.tabs.add(new Workspace());
            }
            // Notify the rest of the application that login was successful
            Saiku.events.trigger('session:new', {
                session: this
            });
        } else {
            if (! Settings.ACTION) {
                Saiku.tabs.add(new Workspace());
            }

        }
    },
    
    prefetch_dimensions: function() {
        if (! this.measures || ! this.dimensions) {
            Log.log({
                Message: "measures or dimensions not initialized",
                Session: JSON.stringify(this)
            });
            return;
        }
        
        for(var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            for(var j = 0; j < connection.catalogs.length; j++) {
                var catalog = connection.catalogs[j];
                for(var k = 0; k < catalog.schemas.length; k++) {
                    var schema = catalog.schemas[k];
                    for(var l = 0; l < schema.cubes.length; l++) {
                        var cube = schema.cubes[l];
                        var key = connection.name + "/" + catalog.name + "/"
                            + ((schema.name == "" || schema.name == null) ? "null" : schema.name) 
                            + "/" + cube.name;

                        if (localStorage && 
                            localStorage.getItem("dimension." + key) !== null &&
                            localStorage.getItem("measure." + key) !== null) {
                            this.dimensions[key] = new Dimension(JSON.parse(localStorage.getItem("dimension." + key)));
                            this.measures[key] = new Measure(JSON.parse(localStorage.getItem("measure." + key)));
                        } else {
                            this.dimensions[key] = new Dimension({ key: key });
                            this.measures[key] = new Measure({ key: key });
                            if (Settings.DIMENSION_PREFETCH === true) {
                                this.dimensions[key].fetch();
                                this.measures[key].fetch();
                            }
                        }
                    }
                }
            }
        }
        
        // Start routing
        if (!this.initialized && Backbone.history) {
            Backbone.history.start();
            this.initialized = true;
        }
    },
    
    url: function() {
        if (this.first) {
            this.first = false;
            return encodeURI(Saiku.session.username + "/discover/");
        }
        else {
            return encodeURI(Saiku.session.username + "/discover/refresh");
        }
    }
});

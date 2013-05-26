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
        if (typeof localStorage !== "undefined" && localStorage) {
            if (localStorage.getItem('expiration') && !(localStorage.getItem('expiration') > (new Date()).getTime())) {
                localStorage.clear();
            } else if (!localStorage.getItem('saiku-version') || (localStorage.getItem('saiku-version') !== Settings.VERSION) ) {
                localStorage.clear();
            }
        }        
        Saiku.ui.block("Loading datasources....");
        this.fetch({success:this.process_datasources},{});
        
    },

    refresh: function() {
        typeof localStorage !== "undefined" && localStorage && localStorage.clear();
        this.clear();
        localStorage.setItem('saiku-version', Settings.VERSION);
        this.fetch({success:this.process_datasources},{});
    },
        
    destroy: function() {
        typeof localStorage !== "undefined" && localStorage && localStorage.clear();
        return false;
    },
    
    process_datasources: function(model, response) {
        // Save session in localStorage for other tabs to use
        if (typeof localStorage !== "undefined" && localStorage && localStorage.getItem('session') === null) {
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
        _.delay(this.prefetch_dimensions, 20);
        
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
                            + "/" + encodeURIComponent(cube.name);

                        if (typeof localStorage !== "undefined" && localStorage && 
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

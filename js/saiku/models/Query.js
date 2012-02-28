/*
 * Query.js
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
 * Workspace query
 */
var Query = Backbone.Model.extend({
    initialize: function(args, options) {
        // Save cube
        _.extend(this, options);
        
        // Bind `this`
        _.bindAll(this, "run", "move_dimension", "reflect_properties");
        
        // Generate a unique query id
        this.uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
            function (c) {
                var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        
        // Initialize properties, action handler, and result handler
        this.action = new QueryAction({}, { query: this });
        this.result = new Result({}, { query: this });
        this.scenario = new QueryScenario({}, { query: this });
    },
    
    parse: function(response) {
        // Assign id so Backbone knows to PUT instead of POST
        this.id = this.uuid;

        // Grab attributes
        if (this.attributes.xml !== undefined && 
            this.attributes.cube === undefined) {            
            this.set({
                connection: response.cube.connectionName,
                catalog: response.cube.catalogName,
                schema: response.cube.schemaName,
                cube: encodeURIComponent(response.cube.name),
                axes: response.saikuAxes,
                type: response.type
            });
        }

        // Fetch initial properties from server
        if (! this.properties) {
            this.properties = new Properties({}, { query: this });
        } else {
            this.properties.fetch({
                success: this.reflect_properties
            });
        }
    },
    
    reflect_properties: function() {
        this.workspace.trigger('properties:loaded');
    },
    
    run: function(force) {
        // Check for automatic execution

        
        if ( (this.properties.properties['saiku.olap.query.automatic_execution'] == "false") &&
            ! (force === true)) {
            return;
        }
        Saiku.ui.unblock();

        // TODO - Validate query
        // maybe we should sync it with the backend query JSON?
        // this definitely needs improvement
        var rows = 0;
        var columns = 0;
        if (this.get('type') != "MDX") {
            if (Settings.MODE == "view" || Settings.MODE == "table") {
                var axes = this.get('axes');
                if (axes) {
                    for (var axis_iter = 0; axis_iter < axes.length; axis_iter++) {
                        var axis = axes[axis_iter];
                        if (axis.name && axis.name == "ROWS") {
                            rows = axis.dimensionSelections.length;
                        }
                        if (axis.name && axis.name == "COLUMNS") {
                            columns = axis.dimensionSelections.length;
                        }
                    }
                }
            } else {
                rows = $(this.workspace.el).find('.rows ul li').size();
                columns = $(this.workspace.el).find('.columns ul li').size(); 
            }

            if (rows == 0 || columns == 0) {
                $(this.workspace.el).find('.workspace_results table')
                    .html('<tr><td><span class="i18n">You need to put at least one level or measure on Columns and Rows for a valid query.</td></tr>');
                return;
            }
        }

        // Run it
        $(this.workspace.el).find('.workspace_results table')
            .html('<tr><td>Running query...</td></tr>');
        this.result.fetch();
    },
    
    move_dimension: function(dimension, target, index) {
        $(this.workspace.el).find('.run').removeClass('disabled_toolbar');
        var url = "/axis/" + target + "/dimension/" + dimension;
        
        this.action.post(url, {
            data: {
                position: index
            },
            
            success: function() {
                if (this.query.properties
                    .properties['saiku.olap.query.automatic_execution'] === 'true') {
                    this.query.run();
                }
            }
        });
    },
    
    url: function() {
        return encodeURI(Saiku.session.username + "/query/" + this.uuid);
    }
});

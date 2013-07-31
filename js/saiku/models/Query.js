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
 * Workspace query
 */
var Query = Backbone.Model.extend({

    formatter: Settings.CELLSET_FORMATTER,
    properties: null,

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
        this.result = new Result({ limit: Settings.RESULT_LIMIT }, { query: this });
        this.scenario = new QueryScenario({}, { query: this });

        this.set({type:'QM'});
    },
    
    parse: function(response) {
        // Assign id so Backbone knows to PUT instead of POST
        this.id = this.uuid;

        this.set({
            connection: response.cube.connectionName,
                catalog: response.cube.catalogName,
                schema: response.cube.schemaName,
                cube: encodeURIComponent(response.cube.name),
                axes: response.saikuAxes,
                type: response.type
        });

        if (typeof response.properties != "undefined" && "saiku.ui.formatter" in response.properties) {
            this.set({formatter : response.properties['saiku.ui.formatter']});
        }

        this.properties = new Properties(response.properties, { query: this });
        this.reflect_properties();
    },
    
    reflect_properties: function() {
        this.workspace.trigger('properties:loaded');
    },

    setProperty: function(key, value) {
        if (typeof this.properties != "undefined" && this.properties.properties ) {
            this.properties.properties[key] = value;
        }
    },
    
    run: function(force, mdx) {
        // Check for automatic execution
        Saiku.ui.unblock();
        if (typeof this.properties != "undefined" && this.properties.properties['saiku.olap.query.automatic_execution'] === 'false'&&
            ! (force === true)) {
            return;
        }
        this.workspace.unblock();

        $(this.workspace.el).find(".workspace_results_info").empty();
        this.workspace.trigger('query:run');
        this.result.result = null;
        // TODO - Validate query
        // maybe we should sync it with the backend query JSON?
        // this definitely needs improvement
        if (this.get('type') != "MDX") {
            var rows = $(this.workspace.el).find('.rows ul li').size();
            var columns = $(this.workspace.el).find('.columns ul li').size(); 
            if ((rows == 0 && columns == 0) && !this.workspace.other_dimension) {
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
            }
            if (rows == 0 || columns == 0) {
                $(this.workspace.table.el).html('');
                $(this.workspace.processing).html('<span class="i18n">You need to put at least one level or measure on Columns and Rows for a valid query.</span>').show();
                this.workspace.adjust();
                Saiku.i18n.translate();
                return;
            }
        }


        // Run it
        $(this.workspace.table.el)
            .html('');
        $(this.workspace.processing).html('<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Running query...</span> [&nbsp;<a class="cancel i18n" href="#cancel">Cancel</a>&nbsp;]').show();
        this.workspace.adjust();
        this.workspace.trigger('query:fetch');
		Saiku.i18n.translate();
            // <a class="cancel" href="#cancel">x</a>
        
        var message = '<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Running query...</span> [&nbsp;<a class="cancel i18n" href="#cancel">Cancel</a>&nbsp;]';
        this.workspace.block(message);

        
        if (this.get('type')  == "MDX" && mdx != null) {
            this.result.save({ mdx: mdx});
        } else {
            this.result.fetch();
        }
    },
    
    move_dimension: function(dimension, target, index) {
        $(this.workspace.el).find('.run').removeClass('disabled_toolbar');
        var url = "/axis/" + target + "/dimension/" + dimension;
        
        this.action.post(url, {
            data: {
                position: index
            },
            
            success: function() {
                if (('MODE' in Settings && (Settings.MODE == 'view' || Settings.MODE == 'table')) || (typeof this.query.properties != "undefined" && this.query.properties 
                    .properties['saiku.olap.query.automatic_execution'] === 'true')) {
                    this.query.run(true);
                }
            }
        });
    },
    
    url: function() {
        return encodeURI(Saiku.session.username + "/query/" + this.uuid);
    }
});

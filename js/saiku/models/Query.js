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
        _.bindAll(this, "run");
        
        // Generate a unique query id
        this.uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
            function (c) {
                var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
        
        this.model = _.extend({ name: this.uuid }, SaikuOlapQueryTemplate, args)

        // Initialize properties, action handler, and result handler
        this.action = new QueryAction({}, { query: this });
        this.result = new Result({ limit: Settings.RESULT_LIMIT }, { query: this });
        this.scenario = new QueryScenario({}, { query: this });
    },
    
    parse: function(response) {
        // Assign id so Backbone knows to PUT instead of POST
        this.id = this.uuid;
        this.model = _.extend(this.model, response);
        this.model.properties = _.extend(this.model.properties, Settings.QUERY_PROPERTIES)
    },
    
    setProperty: function(key, value) {
            this.model.properties[key] = value;
    },

    getProperty: function(key) {
        return this.model.properties[key];
    },

    run: function(force, mdx) {
        // Check for automatic execution
        Saiku.ui.unblock();
        if (typeof this.model.properties != "undefined" && this.model.properties['saiku.olap.query.automatic_execution'] === false &&
            ! (force === true)) {
            return;
        }
        this.workspace.unblock();

        $(this.workspace.el).find(".workspace_results_info").empty();
        this.workspace.trigger('query:run');
        this.result.result = null;
        var validated = false;
        var errorMessage = "Query Validation failed!";

        if (this.model.queryType == "OLAP") {
            if (this.model.type == "QUERYMODEL") {
                var columnsOk = Object.keys(this.model.queryModel.axes['COLUMNS'].hierarchies).length > 0;
                var detailsOk = this.model.queryModel.details.axis == 'COLUMNS' && this.model.queryModel.details.measures.length > 0;
                if (!columnsOk && !detailsOk) {
                    errorMessage = '<span class="i18n">You need to put at least one level or measure on Columns and Rows for a valid query.</span>';
                } else if (columnsOk || detailsOk) {
                    validated = true;
                }

            } else if (this.model.type == "MDX") {
                validated = (this.model.mdx && this.model.mdx.length > 0);
                if (!validated) {
                    errorMessage = '<span class="i18n">You need to enter some MDX statement to execute.</span>';
                }
            }
        }
        if (!validated) {
            $(this.workspace.table.el).html('');
            $(this.workspace.processing).html(errorMessage).show();
            this.workspace.adjust();
            Saiku.i18n.translate();
            return;
        }


        // Run it
        $(this.workspace.table.el)
            .html('');
        $(this.workspace.processing).html('<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Running query...</span> [&nbsp;<a class="cancel i18n" href="#cancel">Cancel</a>&nbsp;]').show();
        this.workspace.adjust();
        this.workspace.trigger('query:fetch');
		Saiku.i18n.translate();
        var message = '<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Running query...</span> [&nbsp;<a class="cancel i18n" href="#cancel">Cancel</a>&nbsp;]';
        this.workspace.block(message);

        this.result.save({ query: this.model.data() });
    },
    
    url: function() {
        return "api/query/" + encodeURI(this.uuid);
    }
});

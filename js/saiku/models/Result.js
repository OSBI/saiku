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
 * Holds the resultset for a query, and notifies plugins when resultset updated
 */
var Result = Backbone.Model.extend({

    result: null,
    firstRun: false,
    
    initialize: function(args, options) {
        // Keep reference to query
        this.query = options.query;
    },
    
    parse: function(response) {
        // Show the UI if hidden
        $(this.workspace).unblock();
        Saiku.ui.unblock();
        this.result = response;
        this.firstRun = true;
        this.query.workspace.trigger('query:result', {
            workspace: this.query.workspace,
            data: response
        });

    },

    hasRun: function() {
        return this.firstRun;
    },
    
    lastresult: function () {
        return this.result;
    },
    
    url: function() {
        return encodeURI(this.query.url() + "/result/" + this.query.get('formatter'));
    }
});

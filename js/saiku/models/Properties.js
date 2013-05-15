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
 * Maintains query properties like non empty and automatic execution
 */
var Properties = Backbone.Model.extend({    
    initialize: function(args, options) {
        // Keep track of parent query
        this.query = options.query;
        
        // Update properties with defaults from settings
        this.properties = {};
        _.extend(this.properties, Settings.QUERY_PROPERTIES);
        if (typeof args != "undefined" && args) {
            _.extend(this.properties, args);
        }
    },
    
    toggle: function(key) {
        // Toggle property
        this.properties[key] = this.properties[key] === 'true' ? 
            'false' : 'true';
        
        return this;
    },
    
    update: function(async) {
        // FIXME - this really sucks
        // Why can't we just use the body?
        this.attributes = {
            properties: _.template(
                    "<% _.each(properties, function(property, name) { %>" +
                    "<%= name %> <%= property %>\n" +
                    "<% }); %>"
                    )({ properties: this.properties })
        };
        this.save({ async: async });
    },
    
    parse: function(response) {
        // FIXME - POST should return properties as well
        if (typeof response == "object") {
            _.extend(this.properties, response);
        }
        
        this.query.workspace.trigger('properties:loaded');
    },
    
    url: function() {
        return encodeURI(this.query.url() + "/properties");
    }
});

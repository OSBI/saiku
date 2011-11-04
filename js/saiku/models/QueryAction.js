/*
 * QueryAction.js
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
 * Model which handles "special" actions against the query
 * Ex.: selections, swap axis, mdx
 */
var QueryAction = Backbone.Model.extend({
    initialize: function(args, options) {
        // Keep track of query
        this.query = options.query;
        
        // Set default url
        this.url = this.query.url;
    },
    
    get: function(action, options) {
        this.handle("fetch", action, options);
    },
    
    post: function(action, options) {
        this.handle("save", action, options);
    },
    
    put: function(action, options) {
        this.id = _.uniqueId('queryaction_');
        this.handle("save", action, options);
        delete this.id;
    },
    
    del: function(action, options) {
        this.id = _.uniqueId('queryaction_');
        this.handle("delete", action, options);
        delete this.id;
    },
    
    // Call arbitrary actions against the query
    handle: function(method, action, options) {
        // Set query action
        this.url = this.query.url() + escape(action);
        
        // Clear out old attributes
        this.attributes = options.data? options.data : {};
        
        // Initiate action
        if (method == "save") {
            // Handle response from server
            this.parse = options.success;
            
            this.save();
        } else if (method == "delete") {
            this.destroy(options);
        } else if (method == "fetch") {
            this.parse = function() {};
            this.fetch(options);
        }
    }
});

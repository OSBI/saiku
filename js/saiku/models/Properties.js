/*
 * Properties.js
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
 * Maintains query properties like non empty and automatic execution
 */
var Properties = Backbone.Model.extend({    
    initialize: function(args, options) {
        // Keep track of parent query
        this.query = options.query;
        
        // Update properties with defaults from settings
        this.properties = {};
        _.extend(this.properties, Settings.QUERY_PROPERTIES);
        this.update();
    },
    
    toggle: function(key) {
        // Toggle property
        this.properties[key] = this.properties[key] === 'true' ? 
            'false' : 'true';
        
        return this;
    },
    
    update: function() {
        // FIXME - this really sucks
        // Why can't we just use the body?
        this.attributes = {
            properties: _.template(
                    "<% _.each(properties, function(property, name) { %>" +
                    "<%= name %> <%= property %>\n" +
                    "<% }); %>"
                    )({ properties: this.properties })
        };
        this.save();
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

/*
 * Dimension.js
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
 * Model which fetches the dimensions for a cube
 */
var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.set({
            template: _.template($("#template-dimensions").html())({
                dimensions: response
            }),
            
            data: response
        });
        
        typeof localStorage !== "undefined" && localStorage && localStorage.setItem("dimension." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});

/**
 * Model which fetches the measures for a cube
 */
var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/measures";
    },
    
    parse: function(response) {
        this.set({ 
            template: _.template($("#template-measures").html())({
                measures: response
            }),
            
            data: response
        });
        
        typeof localStorage !== "undefined" && localStorage && localStorage.setItem("measure." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});

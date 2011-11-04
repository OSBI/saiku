/*
 * Member.js
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
 * Controls member selections
 */
var Member = Backbone.Model.extend({
    initialize: function(args, options) {
        this.cube = options.cube;
        var dimension = options.dimension.split("/");
        this.dimension = dimension[0];
        this.hierarchy = dimension[2];
        this.level = dimension[3];
    },
    
    url: function() {
        var url = encodeURI(Saiku.session.username + "/discover/" + 
            this.cube + "/dimensions/" + this.dimension +  
            "/hierarchies/" + this.hierarchy + "/levels/" + this.level);
        
        return url;
    }
});

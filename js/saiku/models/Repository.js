/*
 * Repository.js
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
 * Repository query
 */
var SavedQuery = Backbone.Model.extend({
    parse: function(response, XHR) {
        this.xml = response.xml;
    },
    
    url: function() {
        var segment = Settings.BIPLUGIN ? 
                "/pentahorepository/" : "/repository/queries/";
        return encodeURI(Saiku.session.username + segment + this.get('name'));
    },
    
    move_query_to_workspace: function(model, response) {
        var query = new Query({ 
            xml: model.xml
        }, {
            name: model.get('name')
        });
        
        var tab = Saiku.tabs.add(new Workspace({ query: query }));
    }
});

/**
 * Repository adapter
 */
var Repository = Backbone.Collection.extend({
    model: SavedQuery,
    
    initialize: function(args, options) {
        this.dialog = options.dialog;
    },
    
    parse: function(response) {
        this.dialog.populate(response);
    },
    
    url: function() {
        var segment = Settings.BIPLUGIN ? 
            "/pentahorepository" : "/repository/queries";
        return encodeURI(Saiku.session.username + segment);
    }
});

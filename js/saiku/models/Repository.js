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

var RepositoryObject = Backbone.Model.extend( {
    url: function( ) {
        var segment = Settings.BIPLUGIN ? 
            "/pentahorepository" : "/repository2/resource";
        return encodeURI(Saiku.session.username + segment);
    }
} );

var SavedQuery = Backbone.Model.extend({

    parse: function(response) {
        //console.log("response: " + response);
        //this.xml = response;
    },
    
    url: function() {
        var u = Settings.BIPLUGIN ? 
                encodeURI(Saiku.session.username + "/pentahorepository/" + this.get('name'))  
                    : encodeURI(Saiku.session.username + "/repository2/resource");
        return u;
    },
    
    move_query_to_workspace: function(model, response) {
        for (var key in Settings) {
            if (key.match("^PARAM")=="PARAM") {
                var variable = key.substring("PARAM".length, key.length)
                model.xml = model.xml.replace("${" + variable + "}", Settings[key]);
            }
        }
        var query = new Query({ 
<<<<<<< HEAD
            xml: model.xml,
            formatter: Settings.CELLSET_FORMATTER
        },{
            name: model.get('name')
=======
            xml: response
        }, {
            name: model.get('file')
>>>>>>> 8d445381339c8033ddc6dd9a82dfd6d7b86d4769
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
            "/pentahorepository" : "/repository2/?type=saiku";
        return encodeURI(Saiku.session.username + segment);
    }
});

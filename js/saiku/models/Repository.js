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
 * Repository query
 */
var RepositoryUrl = "api/repository";
var repoPathUrl = function() {
    /*
    return (Settings.BIPLUGIN5 ? "/repository"
                    : (Settings.BIPLUGIN ? "/pentahorepository2" : "/repository2"));
    */
    if (Settings.BIPLUGIN)
        return "pentaho/repository";
    
    return  RepositoryUrl;
};



var RepositoryObject = Backbone.Model.extend( {
    url: function( ) {
        var segment = repoPathUrl() + "/resource";
        return segment;
    }
} );

var RepositoryAclObject = Backbone.Model.extend( {
    url: function( ) {
        var segment = repoPathUrl() + "/resource/acl";
        return segment;
    },
    parse: function(response) {
        if (response != "OK") {
            _.extend(this.attributes, response);
        }
    }
} );

var RepositoryZipExport = Backbone.Model.extend( {
    url: function( ) {
        var segment = repoPathUrl() + "/zip";
        return segment;
    }
} );

var SavedQuery = Backbone.Model.extend({

    parse: function(response) {
        //console.log("response: " + response);
        //this.xml = response;
    },
    
    url: function() {
        var u = repoPathUrl() + "/resource";
        return u;

    },
    
    move_query_to_workspace: function(model, response) {
        var file = response;
        var filename = model.get('file');
        for (var key in Settings) {
            if (key.match("^PARAM")=="PARAM") {
                var variable = key.substring("PARAM".length, key.length);
                var Re = new RegExp("\\$\\{" + variable + "\\}","g");
                var Re2 = new RegExp("\\$\\{" + variable.toLowerCase() + "\\}","g");
                file = file.replace(Re,Settings[key]);
                file = file.replace(Re2,Settings[key]);
                
            }
        }
        var query = new Query({ 
            xml: file,
            formatter: Settings.CELLSET_FORMATTER
        },{
            name: filename
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
        if (options && options.dialog) {
            this.dialog = options.dialog;
        }
    },
    
    parse: function(response) {
        if (this.dialog) {
            this.dialog.populate(response);
        }
    },
    
    url: function() {
        var segment = repoPathUrl() + "?type=saiku";
        return segment;
    }
});

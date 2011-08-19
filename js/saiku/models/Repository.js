/**
 * Repository query
 */
var SavedQuery = Backbone.Model.extend({
    parse: function(response, XHR) {
        this.xml = response.xml;
    },
    
    url: function() {
        return encodeURI(Saiku.session.username + "/repository/" + this.get('name'));
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
        return encodeURI(Saiku.session.username + "/repository");
    }
});
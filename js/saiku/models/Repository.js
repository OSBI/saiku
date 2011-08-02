var SavedQuery = Backbone.Model.extend({
    parse: function(response, XHR) {
        $query = $(response).find('Query');
        
        var tab = Saiku.tabs.add(Workspace);
        var query = new Query({ 
            xml: XHR.responseText
        }, {
            caption: this.attributes.name,
            workspace: tab.content
        });
        tab.content.query = query;
        tab.content.init_query();
    },
    
    url: function() {
        return Saiku.session.username + "/repository/" + this.get('name');
    }
});

var Repository = Backbone.Collection.extend({
    model: SavedQuery,
    
    initialize: function(args, options) {
        this.dialog = options.dialog;
    },
    
    parse: function(response) {
        this.dialog.populate(response);
    },
    
    url: function() {
        return Saiku.session.username + "/repository";
    }
});
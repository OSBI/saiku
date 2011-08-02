var SavedQuery = Backbone.Model.extend({
    parse: function(response, XHR) {
        var query = new Query({ 
            xml: XHR.responseText
        }, {
            name: $(response).find('Query').attr('name'),
            caption: this.attributes.name
        });
        var tab = Saiku.tabs.add(Workspace, {
            query: query
        });
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
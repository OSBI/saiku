var SavedQuery = Backbone.Model.extend({
    parse: function(response, XHR) {
        this.xml = XHR.responseText;
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
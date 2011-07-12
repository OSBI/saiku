var Properties = Backbone.Model.extend({    
    initialize: function(args) {
        // Keep track of parent query
        this.query = args.query;
        this.unset('query', { silent: true });
        
        // Save immediately when changed
        this.bind('change', this.save);
    },
    
    url: function() {
        return this.query.url() + "/properties";
    }
});
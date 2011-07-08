var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" 
            + args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.template = _.template("")({
            dimensions: response
        });
        
        return response;
    }
});

var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" 
            + args.key + "/measures";
    },
    
    parse: function(response) {
        this.template = _.template("")({
            dimensions: response
        });
        
        return response;
    }
});

var Cube = Backbone.Model.extend({ 
    initialize: function(args) {
        this.key = args.key;
        this.dimensions = new Dimension({ key: this.key });
        this.measures = new Measure({ key: this.key });
    },
    
    fetch: function() {
        this.fetched = true;
        this.dimensions.fetch();
        this.measures.fetch();
    }
});
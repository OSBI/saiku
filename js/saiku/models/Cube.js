var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.parent = args.parent;
    },
    
    url: function() {
        return Saiku.session.username + "/discover/" 
            + this.parent.key + "/dimensions";
    }
});

var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.parent = args.parent;
    },
    
    url: function() {
        return Saiku.session.username + "/discover/" 
            + this.parent.key + "/measures";
    }
});

var Cube = Backbone.Model.extend({ 
    initialize: function(args) {
        this.key = args.key;
        this.dimensions = new Dimension({ parent: this });
        this.measures = new Measure({ parent: this });
        
        // Make sure fetch can still access children
        _.bindAll(this, "fetch");
    },
    
    fetch: function() {
        console.log("I *would* be fetching the dimensions for " + this.key + " now...");
        this.fetched = true;
        //this.dimensions.fetch();
        //this.measures.fetch();
    }
});
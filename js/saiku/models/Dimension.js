var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.set({
            template: _.template($("#template-dimensions").text())({
                dimensions: response
            })
        });
        
        return response;
    }
});

var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/measures";
    },
    
    parse: function(response) {
        this.set({ 
            template: _.template($("#template-measures").text())({
                measures: response
            })
        });
        
        return response;
    }
});
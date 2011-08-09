var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.set({
            template: _.template($("#template-dimensions").html())({
                dimensions: response
            }),
            
            data: response
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
            template: _.template($("#template-measures").html())({
                measures: response
            })
        });
        
        return response;
    }
});
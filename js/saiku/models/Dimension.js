/**
 * Model which fetches the dimensions for a cube
 */
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
        
        localStorage && localStorage.setItem("dimension." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});

/**
 * Model which fetches the measures for a cube
 */
var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" +
            args.key + "/measures";
    },
    
    parse: function(response) {
        this.set({ 
            template: _.template($("#template-measures").html())({
                measures: response
            }),
            
            data: response
        });
        
        localStorage && localStorage.setItem("measure." + this.get('key'),
                JSON.stringify(this));
        
        return response;
    }
});
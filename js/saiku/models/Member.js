/**
 * Controls member selections
 */
var Member = Backbone.Model.extend({
    initialize: function(args, options) {
        this.cube = options.cube;
        var dimension = options.dimension.split("/");
        this.dimension = dimension[0];
        this.hierarchy = dimension[2];
        this.level = dimension[3];
    },
    
    url: function() {
        var url = encodeURI(Saiku.session.username + "/discover/" + 
            this.cube + "/dimensions/" + this.dimension +  
            "/hierarchies/" + this.hierarchy + "/levels/" + this.level);
        
        return url;
    }
});
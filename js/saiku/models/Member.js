var Member = Backbone.Model.extend({
    url: function() {
        var dimension = this.get('dimension').split("/");
        var url = Saiku.session.username + "/discover/" + 
            this.get('cube') + "/dimensions/" + dimension[0] +  
            "/hierarchies/" + dimension[2] + "/levels/" + dimension[3];
        
        return url;
    }
});
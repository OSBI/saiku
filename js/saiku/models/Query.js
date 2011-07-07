var Query = Backbone.Model.extend({
    initialize: function(args) {
        this.cube = args.cube;
        
        this.name = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },
    
    url: function() {
        return Saiku.session.username + "/query/" + this.id;
    }
});
var Query = Backbone.Model.extend({
    initialize: function(args) {
        this.cube = args.cube;
        
        // Generate a unique query id
        this.name = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
        
        // Parse cube information
        this.parse_cube();
        
        // Create the query on the server workspace
        this.save();
    },
    
    parse_cube: function() {
        var parsed_cube = this.cube.split('/');
        this.attributes.connection = parsed_cube[0];
        this.attributes.catalog = parsed_cube[1];
        this.attributes.schema = parsed_cube[2];
        this.attributes.cube = parsed_cube[3];
    },
    
    url: function() {
        return Saiku.session.username + "/query/" + this.name;
    }
});
var Properties = Backbone.Model.extend({    
    initialize: function(args) {
        // Keep track of parent query
        this.query = args.query;
        this.unset('query', { silent: true });
        
        // Update properties with defaults from settings
        this.properties = {};
        _.extend(this.properties, Settings.QUERY_PROPERTIES);
    },
    
    toggle: function(key) {
        this.properties[key] = ! this.properties[key];
        console.log(this.properties[key]);
        
        // FIXME - this really sucks
        // Why can't we just use the body?
        this.attributes = {
            properties: _.template(
                    "<% _.each(properties, function(property, name) { %>" +
            		"<%= name %> <%= property %>\n" +
            		"<% }); %>"
            		)({ properties: this.properties })
        };
        this.save();
    },
    
    parse: function(response) {
        // FIXME - POST should return properties as well
        if (typeof response == "object") {
            _.extend(this.properties, response);
        }
    },
    
    url: function() {
        return this.query.url() + "/properties";
    }
});
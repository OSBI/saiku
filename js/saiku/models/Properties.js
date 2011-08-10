var Properties = Backbone.Model.extend({    
    initialize: function(args, options) {
        // Keep track of parent query
        this.query = options.query;
        
        // Update properties with defaults from settings
        this.properties = {};
        _.extend(this.properties, Settings.QUERY_PROPERTIES);
        this.update();
    },
    
    toggle: function(key) {
        // Toggle property
        this.properties[key] = this.properties[key] === 'true' ? 
            'false' : 'true';
        
        return this;
    },
    
    update: function() {
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
        
        this.query.workspace.toolbar.reflect_properties();
    },
    
    url: function() {
        return this.query.url() + "/properties";
    }
});
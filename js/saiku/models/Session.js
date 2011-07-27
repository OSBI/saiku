/**
 * Object which handles authentication
 * @param username
 * @param password
 * @returns {Session}
 */
var Session = Backbone.Model.extend({
    username: "",
    password: "",
        
    initialize: function() {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "process_login");
        
        // Check if credentials are already stored
        if (sessionStorage) {
            this.username = localStorage.getItem('username');
            this.password = localStorage.getItem('password');
        }
    },
    
    get_credentials: function() {
        if (this.username === null || this.password === null) {
            // Open form and retrieve credentials
            var form = this.form = new LoginForm({ session: this });
            Saiku.ui.unblock();
            form.render().open();
        } else {
            this.fetch({ success: this.process_login });
        }
        
        return this;
    },
    
    error: function() {
        $(this.form.el).dialog('open');
    },
    
    login: function(username, password) {
        this.username = username;
        localStorage.setItem('username', username);
        this.password = password;
        localStorage.setItem('password', password);
        
        // Create session and fetch connection information
        this.fetch({ success: this.process_login });
        
        // Delete login form
        $(this.form.el).dialog('destroy').remove();
        
        return false;
    },
    
    process_login: function(model, response) {
        // Generate cube navigation for reuse
        this.cube_navigation = _.template($("#template-cubes").text())({
            connections: response
        });
        
        // Create cube objects
        this.dimensions = {};
        this.measures = {};        
        _.each(response, function(connection) {
            _.each(connection.catalogs, function(catalog) {
                _.each(catalog.schemas, function(schema) {
                    _.each(schema.cubes, function(cube) {
                        var key = connection.name + "/" + catalog.name + "/" +
                            schema.name + "/" + cube.name;
                        this.dimensions[key] = new Dimension({ key: key });
                        this.measures[key] = new Measure({ key: key });
                        this.dimensions[key].fetch();
                        this.measures[key].fetch();
                    }, this);
                }, this);
            }, this);
        }, this);
        
        // Show UI
        $(Saiku.toolbar.el).prependTo($("#header"));
        $("#header").show();
        Saiku.ui.unblock();
        
        // Add initial tab
        Saiku.tabs.render();
        Saiku.tabs.add(new Tab());
        
        // Notify the rest of the application that login was successful
        this.trigger('session:new', {
            session: this
        });
    },
    
    url: function() {
        return this.username + "/discover/";
    }
});
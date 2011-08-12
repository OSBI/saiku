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
        _.bindAll(this, "process_login", "prefetch_dimensions");
        
        // Check expiration on localStorage
        if (! (localStorage.getItem('expiration') > (new Date()).getTime())) {
            localStorage.clear();
        }
        
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
        
        // Set expiration on localStorage to one day in the future
        var expires = (new Date()).getTime() + 
            Settings.LOCALSTORAGE_EXPIRATION;
        localStorage.setItem('expiration', expires);
        
        // Create session and fetch connection information
        this.fetch({ success: this.process_login });
        
        // Delete login form
        $(this.form.el).dialog('destroy').remove();
        
        return false;
    },
    
    logout: function() {
        // FIXME - This is a hack (inherited from old UI)
        $('body').hide();
        localStorage.clear();
        location.reload(true);
        return false;
    },
    
    process_login: function(model, response) {
        // Generate cube navigation for reuse
        this.cube_navigation = _.template($("#template-cubes").html())({
            connections: response
        });
        
        // Create cube objects
        this.dimensions = {};
        this.measures = {};
        this.connections = response;
        _.delay(this.prefetch_dimensions, 200);
        
        // Show UI
        $(Saiku.toolbar.el).prependTo($("#header"));
        $("#header").show();
        Saiku.ui.unblock();
        
        // Add initial tab
        Saiku.tabs.render();
        Saiku.tabs.add(new Workspace());
        
        // Notify the rest of the application that login was successful
        Saiku.events.trigger('session:new', {
            session: this
        });
    },
    
    prefetch_dimensions: function() {
        for(var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i];
            for(var j = 0; j < connection.catalogs.length; j++) {
                var catalog = connection.catalogs[j];
                for(var k = 0; k < catalog.schemas.length; k++) {
                    var schema = catalog.schemas[k];
                    for(var l = 0; l < schema.cubes.length; l++) {
                        var cube = schema.cubes[l];
                        var key = connection.name + "/" + catalog.name + "/" +
                            schema.name + "/" + cube.name;
                        this.dimensions[key] = new Dimension({ key: key });
                        this.measures[key] = new Measure({ key: key });
                        this.dimensions[key].fetch();
                        this.measures[key].fetch();
                    }
                }
            }
        }
    },
    
    url: function() {
        return this.username + "/discover/";
    }
});
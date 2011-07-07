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
        var form = this.form = new LoginForm({
            session: this
        });
        
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "process_login");
        
        $(document).ready(function() {
            form.render().open();
        });
    },
    
    error: function() {
        $(this.form.el).dialog('open');
    },
    
    login: function(username, password) {
        this.username = username;
        this.password = password;
        
        // Create session and fetch connection information
        this.fetch({ success: this.process_login });
        
        // Delete login form
        $(this.form.el).dialog('destroy').remove();
        
        return false;
    },
    
    process_login: function(model, response) {
        // Generate cube navigation for reuse
        this.cubes = Saiku.template.get('Cubes')({
            connections: response
        });
        
        // Show UI
        $(Saiku.toolbar.el).prependTo($("#header"));
        $("#header").show();
        Saiku.tabs.render();
        
        // Add initial tab
        Saiku.tabs.add(new Tab);
        
        // Notify the rest of the application that login was successful
        this.trigger('login_successful');
    },
    
    url: function() {
        return this.username + "/discover/";
    }
});
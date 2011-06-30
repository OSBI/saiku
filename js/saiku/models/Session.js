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
        this.fetch();
        
        // Show UI
        $(Saiku.toolbar.el).prependTo($("#header"));
        $("#header").show();
        
        // Add initial tab and delete login form
        Saiku.tabs.add([ new Tab ]);
        $(this.form.el).dialog('destroy').remove();
        
        return false;
    },
    
    url: function() {
        return this.username + "/discover/";
    }
});
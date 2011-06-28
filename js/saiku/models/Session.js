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
        this.form = new LoginForm({
            session: this
        });
        
        var el = this.form.render().el;
        $(document).ready(function() {
            $(el).appendTo($('body')).show();
        });
    },
    
    login: function(username, password) {
        this.username = username;
        this.password = password;
        
        // Create session and fetch connection information
        this.fetch();
        
        // Show UI
        
        // Add initial tab
        //Saiku.tabs.add([ new Tab ]);
        
        return false;
    },
    
    url: function() {
        return this.username + "/discover/";
    }
});
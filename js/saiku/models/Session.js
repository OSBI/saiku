/**
 * Object which handles authentication
 * @param username
 * @param password
 * @returns {Session}
 */
var Session = Backbone.Model.extend({
    username: username ? username : "",
    password: password ? password : "",
    
    login: function(username, password) {
        // Create session
        // Fetch connection information
    }
});
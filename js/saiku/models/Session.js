/**
 * Object which handles authentication and stores connections and cubes
 * @param username
 * @param password
 * @returns {Session}
 */
var Session = Backbone.Model.extend({
    username: null,
    password: null,
        
    initialize: function(args, options) {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "check_session", "process_session", "load_session","login","logout");
        
        // Check if credentials are being injected into session
        if (options && options.username && options.password) {
            this.username = options.username;
            this.password = options.password;
        }
    },

    check_session: function() {

        if (this.sessionid === null || this.username === null || this.password === null) {
            this.fetch({ success: this.process_session })
        } else {
            this.load_session();
        }
    },

    load_session: function() {
        this.sessionworkspace = new SessionWorkspace();
    },

    process_session: function(model, response) {
        //alert(JSON.stringify(response));
        if ((response === null || response.sessionid == null)) {
            // Open form and retrieve credentials
            var form = this.form = new LoginForm({ session: this });
            Saiku.ui.unblock();
            form.render().open();
        } else {
            this.sessionid = response.sessionid;
            this.roles = response.roles;
            this.username = response.username;
            this.load_session();
        }
        
        return this;
    },
    
    error: function() {
        $(this.form.el).dialog('open');
    },
    
    login: function(username, password) {
        //this.username = username;
        //localStorage && localStorage.setItem('username', username);
        //this.password = password;

        //localStorage && localStorage.setItem('password', password);
        
        // Set expiration on localStorage to one day in the future
        var expires = (new Date()).getTime() + 
            Settings.LOCALSTORAGE_EXPIRATION;
        localStorage && localStorage.setItem('expiration', expires);

        this.save({username:username, password:password},{success: this.check_session, error: this.check_session});
        
    },
    
    logout: function() {
        // FIXME - This is a hack (inherited from old UI)
        $('body').hide();
        localStorage && localStorage.clear();
        
        this.destroy({},{success: this.check_session, error: this.check_session});

        return false;
    },

    url: function() {

        return "../session";
    }
});
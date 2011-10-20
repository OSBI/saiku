/**
 * Object which handles authentication and stores connections and cubes
 * @param username
 * @param password
 * @returns {Session}
 */
var Session = Backbone.Model.extend({
    username: null,
    password: null,
    sessionid: null,
        
    initialize: function(args, options) {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
        _.bindAll(this, "check_session", "process_session", "load_session","login");
        // Check if credentials are being injected into session
        if (options && options.username && options.password) {
            this.username = options.username;
            this.password = options.password;
            console.log("hat options");
            console.log(options);
            this.save({username:this.username, password:this.password},{success: this.check_session, error: this.check_session});

        } else {
            this.check_session();
        }
    },

    check_session: function() {
        //alert((this.sessionid === null || this.username === null || this.password === null));
        if (this.sessionid === null || this.username === null || this.password === null) {
            this.clear();
            this.fetch({ success: this.process_session })
        } else {
            this.load_session();
        }
    },

    load_session: function() {
        this.sessionworkspace = new SessionWorkspace();
    },

    process_session: function(model, response) {
        if ((response === null || response.sessionid == null)) {
            console.log(response);
            // Open form and retrieve credentials
            Saiku.ui.unblock();
            this.form = new LoginForm({ session: this });
            this.form.render().open();
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
        // Set expiration on localStorage to one day in the future
        var expires = (new Date()).getTime() + 
            Settings.LOCALSTORAGE_EXPIRATION;
        localStorage && localStorage.setItem('expiration', expires);

        this.save({username:username, password:password},{success: this.check_session, error: this.check_session});
        
    },
    
    logout: function() {
        // FIXME - This is a hack (inherited from old UI)
        Saiku.ui.unblock();
        $('#header').empty().hide();
        $('#tab_panel').remove();

        Saiku.toolbar = new Toolbar();
        localStorage && localStorage.clear();
        this.id = _.uniqueId('queryaction_');
        this.clear();
        this.sessionid = null;
        this.username = null;
        this.password = null;
        this.destroy({success:this.check_session, error:this.check_session});
        delete this.id;

    },

    url: function() {

        return "session";
    }
});
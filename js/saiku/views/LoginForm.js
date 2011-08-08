var LoginForm = Modal.extend({
    type: "login",
    message: "<form id='login_form'>" +
        "<label for='username'>Username</label><br />" +
        "<input type='text' id='username' name='username' value='admin' /><br />" +
        "<label for='password'>Password</label><br />" +
        "<input type='password' id='password' name='password' value='admin' />" +
        "</form>",
        
    buttons: [
        { text: "Login", method: "login" }
    ],
    
    initialize: function(args) {
        _.extend(this, args);
        this.options.title = Settings.VERSION;
        
        // Add events specific to this dialog
        _.extend(this.events, {
            'submit #login_form': 'close',
        });
    },
    
    login: function() {
        var username = $("#username").val();
        var password = $("#password").val();
        $(this.el).dialog('close');
        
        this.session.login(username, password);
        return false;
    }
});
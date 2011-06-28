var LoginForm = Modal.extend({
    title: "Saiku Suite 2.1 SNAPSHOT",
    action: "Login",
    message: "<div class='dialog_body_login'><form id='login_form'>" +
        "<label for='username'>Username</label><br />" +
        "<input type='text' id='username' name='username' value='admin' /><br />" +
        "<label for='password'>Password</label><br />" +
        "<input type='password' id='password' name='password' value='admin' />" +
        "</form></div>",
    
    events: {
        'click .form_button': 'login',
        'submit #login_form': 'login'
    },
    
    login: function() {
        var username = $("#username").val();
        var password = $("#password").val();
        this.close();
        
        this.session.login(username, password);
        return false;
    }
});
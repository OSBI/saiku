/**
 * Model which handles AJAX calls to the Saiku Server
 * If you want to hook the UI up to something besides the Saiku Server,
 * this is the class which you want to override.
 * @returns {SaikuServer}
 */
function SaikuServer() {
    this._request = function (parameters) {
        // Overwrite defaults with incoming parameters
        settings = $.extend({
            type: "GET",
            data: {},
            contentType: 'application/x-www-form-urlencoded',
            success: function () {},
            error: function () {
                view.show_dialog('Error', 'Could not connect to the server, please check your internet connection. ' + 'If this problem persists, please refresh the page.', 'error');
            },
            dataType: "json",
            rewrite: false,
            cache: false,
            username: Saiku.session.username,
            password: Saiku.session.password
        }, parameters);
        
        // Properly address url
        settings.url = TOMCAT_WEBAPP + REST_MOUNT_POINT 
            + encodeURI(settings.url);
        
        // Method override for BI server
        if (Saiku.settings.PLUGIN === true && settings.rewrite === true
                && (settings.type == 'PUT' || settings.type == 'DELETE')) {
            settings.type = "POST";
            settings.beforeSend = function(xhr) {
                xhr.setRequestHeader("X-Http-Method-Override", settings.type);
            };
        }
        
        $.ajax(settings);
    };
}
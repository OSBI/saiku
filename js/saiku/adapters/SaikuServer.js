/**
 * Model which handles AJAX calls to the Saiku Server
 * If you want to hook the UI up to something besides the Saiku Server,
 * this is the class which you want to override.
 * @returns {SaikuServer}
 */
Backbone.sync = function sync(method, model, success, error) {
    // Overwrite defaults with incoming parameters
    
    methods = {
        'create': "POST",
        'read': "GET",
        'update': "PUT",
        'delete': "DELETE"
    };
    
    settings = {
        type: methods[method],
        data: model,
        contentType: 'application/x-www-form-urlencoded',
        success: success,
        error: error,
        dataType: "json",
        rewrite: false,
        cache: false,
        username: Saiku.session.username,
        password: Saiku.session.password
    };
    
    // Properly address url
    settings.url = Saiku.settings.TOMCAT_WEBAPP 
        + Saiku.settings.REST_MOUNT_POINT 
        + encodeURI(model.url);
    
    // Method override for BI server
    if (Saiku.settings.PLUGIN === true && Backbone.emulateHTTP === true
            && (methods[method] == 'PUT' || methods[method] == 'DELETE')) {
        settings.beforeSend = function(xhr) {
            xhr.setRequestHeader("X-HTTP-Method-Override", settings.type);
        };
        settings.type = "POST";
    }
    
    console.log("syncing server");
    $.ajax(settings);
};
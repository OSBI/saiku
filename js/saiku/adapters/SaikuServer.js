/**
 * Model which handles AJAX calls to the Saiku Server
 * If you want to hook the UI up to something besides the Saiku Server,
 * this is the class which you want to override.
 * @returns {SaikuServer}
 */
Backbone.sync = function(method, model, options) {
    var params;
    methodMap = {
        'create': "POST",
        'read': "GET",
        'update': "PUT",
        'delete': "DELETE"
    };
    
    // Generate AJAX action
    var type = methodMap[method];
    var url = Settings.REST_URL
        + (_.isFunction(model.url) ? model.url() : model.url);
    
    // Prepare for failure
    options.retries = 0;
    
    var failure = function(jqXHR, textStatus, errorThrown) {
        options.retries++;
        
        if (options.retries > 3) {
            if (options.error) {
                options.error(jqXHR, textStatus, errorThrown);
            } else {
                Saiku.ui.block("Could not reach server. Please try again later...");
            }
        } else {
            var delay = Math.pow(options.retries, 2);
            Saiku.ui.block("Having trouble reaching server. Trying again in " + delay + " seconds...");
            setTimeout(function() {
                $.ajax(params);
            }, delay * 1000);
        }
    };
    
    var success = function(data, textStatus, jqXHR) {
        Saiku.ui.unblock();
        options.success(data, textStatus, jqXHR);
    };

    // Default JSON-request options.
    params = {
      url:          url,
      username:     Saiku.session.username,
      password:     Saiku.session.password,
      type:         type,
      cache:        false,
      data:         model.attributes,
      success:      success,
      error:        failure
    };

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Settings.PLUGIN && Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }

    // Make the request
    $.ajax(params);
};
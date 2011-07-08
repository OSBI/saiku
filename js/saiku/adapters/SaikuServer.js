/**
 * Model which handles AJAX calls to the Saiku Server
 * If you want to hook the UI up to something besides the Saiku Server,
 * this is the class which you want to override.
 * @returns {SaikuServer}
 */
Backbone.sync = function(method, model, options) {
    methodMap = {
        'create': "POST",
        'read': "GET",
        'update': "PUT",
        'delete': "DELETE"
    };
    
    var type = methodMap[method];
    var url = Saiku.settings.REST_URL
        + (_.isFunction(model.url) ? model.url() : model.url);
    
    console.log(model.attributes);

    // Default JSON-request options.
    var params = {
      url:          url,
      username:     Saiku.session.username,
      password:     Saiku.session.password,
      type:         type,
      cache:        false,
      data:         model.attributes,
      dataType:     'json',
      success:      options.success,
      error:        options.error
    };

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Saiku.settings.PLUGIN && Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }

    // Make the request.
    $.ajax(params);
};
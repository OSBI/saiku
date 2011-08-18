/**
 * Base 64 module
 */
;(function (window) {

  var
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    fromCharCode = String.fromCharCode,
    INVALID_CHARACTER_ERR = (function () {
      // fabricate a suitable error object
      try { document.createElement('$'); }
      catch (error) { return error; }}());

  // encoder
  window.Base64 || (
  window.Base64 = { encode: function (string) {
    var
      a, b, b1, b2, b3, b4, c, i = 0,
      len = string.length, max = Math.max, result = '';

    while (i < len) {
      a = string.charCodeAt(i++) || 0;
      b = string.charCodeAt(i++) || 0;
      c = string.charCodeAt(i++) || 0;

      if (max(a, b, c) > 0xFF) {
        throw INVALID_CHARACTER_ERR;
      }

      b1 = (a >> 2) & 0x3F;
      b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
      b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
      b4 = c & 0x3F;

      if (!b) {
        b3 = b4 = 64;
      } else if (!c) {
        b4 = 64;
      }
      result += characters.charAt(b1) + characters.charAt(b2) + characters.charAt(b3) + characters.charAt(b4);
    }
    return result;
  }});

}(this));

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
        
        if (options.retries >= 10) {
            Saiku.ui.block("Could not reach server. Please try again later...");
            if (options.error) {
                options.error(jqXHR, textStatus, errorThrown);
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
        if (options.retries > 0) {
            Saiku.ui.unblock();
        }
        
        options.success(data, textStatus, jqXHR);
    };

    // Default JSON-request options.
    params = {
      url:          url,
      type:         type,
      cache:        false,
      data:         model.attributes,
      success:      success,
      error:        failure,
      beforeSend:   function(request) {
        if (!Settings.PLUGIN) {
          var auth = "Basic " + Base64.encode(
              Saiku.session.username + ":" + Saiku.session.password
          );
          request.setRequestHeader('Authorization', auth);
          }
      }
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
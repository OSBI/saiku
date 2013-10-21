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


var isIE = (function(){
    var undef, v = 3; 
    
    var dav = navigator.appVersion;
    
    if(dav.indexOf('MSIE') != -1) {
        v  = parseFloat(dav.split('MSIE ')[1]);
        return v> 4 ? v : false;
    }
    return false;

}());



var SaikuConfig = {
  server: null,
  user: null,
  password: null
};

var SaikuCall = {
  file: null,
  render: 'table', // table | chart
  mode: 'null', // table: sparkline, sparkbar - chart: line, bar, treemap, ...
  formatter: 'flattened', // should be left unless you want an hierarchical resultset
  htmlObject: "saiku",
  params: {

  }

}
var SaikuRenderer = {
  "table" : SaikuTableRenderer,
  "chart" : SaikuChartRenderer
};

var SaikuClient = function(config) {
  this.config = _.extend(
    SaikuConfig,
    config
  );
};
SaikuClient.prototype.error = function(jqXHR, textStatus, errorThrown) {
      if (typeof console != "undefined" && console) {
        console.error(textStatus);
        console.error(jqXHR);
        console.error(errorThrown);
      }
};

SaikuClient.prototype.execute = function(usercall) {
  call = _.extend(
    SaikuCall,
    usercall
  );
  console.log(call);
  var client = this.config;
  call.params = _.extend(
    call.params,
    { "formatter" : call.formatter },
    { "file" : call.file }
);

  

  var params = {
      url:          client.server + "/rest/saiku/embed/export/saiku/json",
      type:         'GET',
      cache:        false,
      data:         call.params,
      contentType:  'application/x-www-form-urlencoded',
      dataType:     "json",
      success:      function(data, textStatus, jqXHR) {
        
            if (usercall.render in SaikuRenderer) {
                  var r = new SaikuRenderer[usercall.render](data, usercall);
                  r.render();
            } else {
              alert('Render type ' + usercall.render + " not found!");
            }
      },
      error:        this.error,
      crossDomain: true,
      async:        true,
      beforeSend:   function(request) {
          var auth = "Basic " + Base64.encode(
              client.user + ":" + client.password
          );
          request.setRequestHeader('Authorization', auth);
          return true;
        }
      };
    
    $.ajax(params);
};

;(function(window) {
	'use strict';

	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var fromCharCode = String.fromCharCode;
	var INVALID_CHARACTER_ERR = (function() {
			// fabricate a suitable error object
			try { 
				document.createElement('$'); 
			}
			catch(error) { 
				return error; 
			}
		}());

	// Encoder
	window.Base64 || (
		window.Base64 = { encode: function(string) {
			var a, b, b1, b2, b3, b4, c, i = 0,
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
				} 
				else if (!c) {
					b4 = 64;
				}
				result += characters.charAt(b1) + characters.charAt(b2) + characters.charAt(b3) + characters.charAt(b4);
			}
			return result;
		}});
}(this));

var isIE = (function() {
	var undef, v = 3;
	var dav = navigator.appVersion;

	if (dav.indexOf('MSIE') !== -1) {
		v  = parseFloat(dav.split('MSIE ')[1]);
		return v > 4 ? v : false;
	}

	return false;
}());

var SaikuClient = (function() {
	'use strict';

	var _settings = {
		server: '/saiku',
		path: '/rest/saiku/embed',
		user: 'admin',
		password: 'admin'
	};

	var _options = {
		file: null,
		render: 'table',
		mode: null,
		formatter: 'flattened',
		htmlObject: '#saiku',
		zoom: true,
		params: {}
	};

	var _saikuRendererFactory = {
		'table': SaikuTableRenderer,
		'chart': SaikuChartRenderer
	};

	function SaikuClient(opts) {
		// enforces new
		if (!(this instanceof SaikuClient)) {
			return new SaikuClient(opts);
		}

		this.settings = _.extend(_settings, opts);
	}

	SaikuClient.prototype.execute = function(opts) {
		var self = this;
		var parameters = {};
		var options = _.extend({}, _options, opts);

		if (options.params) {
			for (var key in options.params) {
				if (options.params.hasOwnProperty(key)) {
					parameters['param' + key] = options.params[key];
				}
			}
		}

		parameters = _.extend(
			parameters,
			{ 'formatter': options.formatter },
			{ 'file': options.file }
		);

		var params = {
			url: self.settings.server + (self.settings.path ? self.settings.path : '') + '/export/saiku/json',
			type: 'GET',
			cache: false,
			data: parameters,
			contentType: 'application/x-www-form-urlencoded',
			dataType: 'json',
			crossDomain: true,
			async: true,
			beforeSend: function(request) {
				if (self.settings.user && self.settings.password) {
					var auth = 'Basic ' + Base64.encode(
							self.settings.user + ':' + self.settings.password
						);
					request.setRequestHeader('Authorization', auth);
					return true;
				}
			},
			success: function(data, textStatus, jqXHR) {
				var renderMode = data.query.properties['saiku.ui.render.mode'] ? data.query.properties['saiku.ui.render.mode'] : options.render;
				var mode =  data.query.properties['saiku.ui.render.type'] ? data.query.properties['saiku.ui.render.type'] : options.mode;

				options['mode'] = mode;

				if (options.render in _saikuRendererFactory) {
					var saikuRenderer = new _saikuRendererFactory[options.render](data, options);
					saikuRenderer.render();
				}
				else {
					alert('Render type ' + options.render + ' not found!');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// body...
			}
		};

		$.ajax(params);
	};

	return SaikuClient;
}());

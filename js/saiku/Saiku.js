/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
 
/**
 * Central object for handling global application state
 */
var Saiku = {
    /**
     * View which manages toolbar interactions
     */
    toolbar: {},
    
    /**
     * View which handles tabs
     */
    tabs: new TabSet(),

    splash: new SplashScreen(),
    /**
     * Model which handles session and authentication
     */
    session: null,
    
    /**
     * Global event bus
     */
    events: _.extend({}, Backbone.Events),
    
    /**
     * Collection of routers for page fragments
     */
    routers: [],

    /**
     * Convenience functions for blocking the UI
     */
    ui: {
        block: function(message) {
            $('.processing_message').html(message);
            $('.processing_message').removeClass("i18n_translated").addClass("i18n");
            Saiku.i18n.translate();

            $('.processing,.processing_container').show();  
        },
        
        unblock: function() {
            $('.processing,.processing_container, .blockOverlay').hide();

            // Fix For Internet Explorer 10 UIBlock issue
            $('.blockUI').fadeOut('slow');
        }
    },
    log: function(channel, item) {
        if (console && console.log) {
            console.log("Logging for: " + channel);
            if (item) {
                console.log(item);
            }
        }
    },
    error: function(channel, item) {
        if (console && console.error) {
            console.error("Logging for: " + channel);
            console.error(item);
        }
    },
    loadCSS: function(href, media) {
        var cssNode = window.document.createElement('link'),
            ref = window.document.getElementsByTagName('script')[0];

        cssNode.rel = 'stylesheet';
        cssNode.href = href;

        // Temporarily, set media to something non-matching to 
        // ensure it'll fetch without blocking render
        cssNode.media = 'only x';

        // Inject link
        ref.parentNode.insertBefore(cssNode, ref);

        // Set media back to `all` so that the 
        // stylesheet applies once it loads
        setTimeout(function() {            
            cssNode.media = media || 'all';
        });

        return cssNode;
    },
    loadJS: function(src, callback) {
        var scriptNode = window.document.createElement('script'),
            ref = window.document.getElementsByTagName('script')[0];

        scriptNode.src = src;

        // Inject script
        ref.parentNode.insertBefore(scriptNode, ref);

        // if callback...
        if (callback && typeof(callback) === 'function') {
            scriptNode.onload = callback;
        }

        return scriptNode;
    },
    URLParams: {
        buildValue: function(value) {
            if (/^\s*$/.test(value))           { return null; }
            if (/^(true|false)$/i.test(value)) { return value.toLowerCase() === 'true'; }
            if (isFinite(value))               { return parseFloat(value); }
            if (isFinite(Date.parse(value)))   { return new Date(value); }

            return value;
        },

        equals: function() {
            params = Array.prototype.slice.call(arguments);

            var paramsURI = {},
                keyValue,               
                couples = window.location.search.substr(1).split('&');

            if (window.location.search.length > 1) {
                for (var keyId = 0; keyId < couples.length; keyId++) {                    
                    keyValue = couples[keyId].split('=');
                    paramsURI[decodeURIComponent(keyValue[0])] = keyValue.length > 1 ? this.buildValue(decodeURIComponent(keyValue[1])) : null;
                }
            }

            if (_.isEqual(paramsURI, params[0])) {
                return true;
            }
            else {
                return false;
            }
        }
    }
};

/**
 * Setting this option to true will fake PUT and DELETE requests 
 * with a HTTP POST, and pass them under the _method parameter. 
 * Setting this option will also set an X-HTTP-Method-Override header 
 * with the true method. This is required for BI server integration
 */
Backbone.emulateHTTP = false;

/**
 * Up up and away!
 */
if (! Settings.BIPLUGIN) {
    $(document).ready(function() {
        var plugins = new PluginCollection();

        plugins.fetch({
            success: function() {
                var i = plugins.size();
                var j = 0;
                plugins.each(function(log) {
                    j = j+1;
                    jQuery.getScript(log.attributes.path);

                    if(j == i) {
                        Saiku.session = new Session({}, {
                            username: Settings.USERNAME,
                            password: Settings.PASSWORD
                        });

                        Saiku.toolbar = new Toolbar();
                    }
                });
            }
        });

    });
}
/**
 * Dynamically load plugins!
 * @type {PluginCollection}
 */


var SaikuTimeLogger = function(element) {
    this._element = $(element);
    this._timestamps = [];
    this._events = [];
};



SaikuTimeLogger.prototype.log = function(eventname) {
    var time = (new Date()).getTime();
    if (!eventname) {
        eventname = "Unknown";
    }
    if (this._timestamps.length > 0) {
        var lastTime = this._timestamps[this._timestamps.length -1];
        if ((time - lastTime) > 1) {
            this._element.append( "<div>" + (time - lastTime) + " ms " + eventname + '  (previous: ' + this._events[this._events.length -1]  + " )</div>");
        }
    }
    this._timestamps.push(time);
    this._events.push(eventname);
};

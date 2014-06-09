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
    }
};

/**
 * Setting this option to true will fake PUT and DELETE requests 
 * with a HTTP POST, and pass them under the _method parameter. 
 * Setting this option will also set an X-HTTP-Method-Override header 
 * with the true method. This is required for BI server integration
 */
Backbone.emulateHTTP = false;

var plugins = new PluginCollection();
/**
 * Up up and away!
 */
if (! Settings.BIPLUGIN) {
    $(document).ready(function() {
        plugins.fetch({
            success: function () {
                plugins.each(function (log) {
                    jQuery.getScript(log.attributes.path);
                    Saiku.session = new Session({}, {
                        username: Settings.USERNAME,
                        password: Settings.PASSWORD
                    });

                    Saiku.toolbar = new Toolbar();
                });
            }
        });
    });
}


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

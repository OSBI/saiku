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
            $('.processing,.processing_container').fadeIn();
            $('.processing_message').text(message);
        },
        
        unblock: function() {
            $('.processing,.processing_container').fadeOut();
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
        Saiku.session = new Session();
        Saiku.toolbar = new Toolbar();
        Saiku.session.get_credentials();
    });
}
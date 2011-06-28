/**
 * Central object for handling global application state
 */
var Saiku = {
    settings: {
        PLUGIN: false,
        BASE_URL: "/",
        TOMCAT_WEBAPP: "/saiku/",
        REST_MOUNT_POINT: "rest/saiku/"
    },
    tabs: new TabSet,
    session: new Session
};

/**
 * Setting this option to true will fake PUT and DELETE requests 
 * with a HTTP POST, and pass them under the _method parameter. 
 * Setting this option will also set an X-HTTP-Method-Override header 
 * with the true method. This is required for BI server integration
 */
Backbone.emulateHTTP = false;
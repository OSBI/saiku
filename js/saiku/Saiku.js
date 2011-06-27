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
    tabs: [],
    add_tab: function() {
        var controller = new Controller();
        Saiku.tabs.push(controller);
        return controller;
    },
    session: new Session(),
    model: new SaikuServer()
};

//Saiku.add_tab();
/**
 * Change settings here
 */
var Settings = {
    PLUGIN: false,
    BASE_URL: "/",
    TOMCAT_WEBAPP: "saiku/",
    REST_MOUNT_POINT: "rest/saiku/",
    DIMENSION_PREFETCH: true
};

Settings.REST_URL = Settings.BASE_URL
    + Settings.TOMCAT_WEBAPP 
    + Settings.REST_MOUNT_POINT;
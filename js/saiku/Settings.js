/**
 * Change settings here
 */
var Settings = {
    PLUGIN: false,
    BASE_URL: "/",
    TOMCAT_WEBAPP: "saiku/",
    REST_MOUNT_POINT: "rest/saiku/",
    DIMENSION_PREFETCH: true,
    HIDE_ERRORS: false,
    QUERY_PROPERTIES: {
        'saiku.olap.query.automatic_execution': 'true',
        'saiku.olap.query.nonempty': 'true',
        'saiku.olap.query.nonempty.rows': 'true',
        'saiku.olap.query.nonempty.columns': 'true'
    }
};

Settings.REST_URL = Settings.BASE_URL
    + Settings.TOMCAT_WEBAPP 
    + Settings.REST_MOUNT_POINT;
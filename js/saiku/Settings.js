/**
 * Change settings here
 */
var Settings = {
    VERSION: "Saiku Suite 2.2 SNAPSHOT",
    BIPLUGIN: false,
    BASE_URL: "",
    TOMCAT_WEBAPP: "/saiku",
    REST_MOUNT_POINT: "/rest/saiku/",
    DIMENSION_PREFETCH: true,
    HIDE_ERRORS: false,
    QUERY_PROPERTIES: {
        'saiku.olap.query.automatic_execution': 'true',
        'saiku.olap.query.nonempty': 'true',
        'saiku.olap.query.nonempty.rows': 'true',
        'saiku.olap.query.nonempty.columns': 'true'
    },
    PLUGINS: [
        "Chart"
    ],
    LOCALSTORAGE_EXPIRATION: 10 * 60 * 60 * 1000 /* 10 hours, in ms */
};

/**
 * Extend settings with query parameters
 */
Settings.GET = function () {
    var qs = document.location.search;
    qs = qs.split("+").join(" ");
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        var value = decodeURIComponent(tokens[2]);
        if (! isNaN(value)) value = parseInt(value);
        if (value === "true") value = true;
        if (value === "false") value = false;
        params[decodeURIComponent(tokens[1]).toUpperCase()]
            = value;
    }

    return params;
}();
_.extend(Settings, Settings.GET);

Settings.REST_URL = Settings.BASE_URL
    + Settings.TOMCAT_WEBAPP 
    + Settings.REST_MOUNT_POINT;
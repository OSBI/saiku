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
 * Change settings here
 */
var Settings = {
    VERSION: "Saiku 2.5-SNAPSHOT",
    BIPLUGIN: false,
    BASE_URL: "",
    TOMCAT_WEBAPP: "/saiku",
    REST_MOUNT_POINT: "/rest/saiku/",
    DIMENSION_PREFETCH: true,
    ERROR_LOGGING: false,
    // number of erroneous ajax calls in a row before UI cant recover
    ERROR_TOLERANCE: 3,
    QUERY_PROPERTIES: {
        'saiku.olap.query.automatic_execution': 'true',
        'saiku.olap.query.nonempty': 'true',
        'saiku.olap.query.nonempty.rows': 'true',
        'saiku.olap.query.nonempty.columns': 'true'
    },
    /* Valid values for CELLSET_FORMATTER:
     * 1) flattened
     * 2) flat
     */
    CELLSET_FORMATTER: "flattened",
    // limits the number of rows in the result
    // 0 - no limit
    RESULT_LIMIT: 0,
    MEMBERS_FROM_RESULT: true,
    PLUGINS: [
        "Chart"
    ],
    TELEMETRY_SERVER: 'http://telemetry.analytical-labs.com:7000',
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


/**
 * < IE9 doesn't support Array.indexOf
 */
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

if (window.location.hostname && (window.location.hostname == "dev.analytical-labs.com" || window.location.hostname == "demo.analytical-labs.com" )) {
    Settings.USERNAME = "admin";
    Settings.PASSWORD = "admin";
}

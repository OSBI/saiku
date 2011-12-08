/*
 * Settings.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
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
    ERROR_LOGGING: false,
    QUERY_PROPERTIES: {
        'saiku.olap.query.automatic_execution': 'true',
        'saiku.olap.query.nonempty': 'true',
        'saiku.olap.query.nonempty.rows': 'true',
        'saiku.olap.query.nonempty.columns': 'true'
    },
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

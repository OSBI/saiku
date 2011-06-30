/* Saiku UI -- a user interface for the Saiku Server
   Copyright (C) Paul Stoellberger, 2011.

   This library is free software; you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public
   License as published by the Free Software Foundation; either
   version 3 of the License, or (at your option) any later version.

   This library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General
   Public License along with this library; if not, write to the
   Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
   Boston, MA 02110-1301 USA 
*/

/**
 * @fileOverview    This represents the controller for Saiku UI.
 * @description     This will lazy load and init the model and view.
 * @version         1.0.0
 */

/**
 * Global variables that control where REST API calls are sent
 */

// The name of the Saiku UI webapp in Tomcat
PLUGIN = "false";

BASE_URL = "/";
	
// The name of the Saiku server webapp in Tomcat
TOMCAT_WEBAPP = "/saiku/";
	
// The preferred REST mountpoint for Enunciate
REST_MOUNT_POINT = "rest/saiku/";

/**
 * Controller class
 * @class
 */
var controller = {


    /** Handle click when the new query button is clicked. */
    add_tab : function () {
        view.tabs.add_tab();
    },

    /** Handle click when the open query button is clicked. */
    open_query : function () {
        view.tabs.open_query_tab();
    },

    /** Handle click when the delete query button is clicked. */
    delete_query : function () {},

    /** Handle click when the save logout button is clicked. */
    logout : function () {
        view.destroy_ui();
        location.reload(true);
    },

    /** Handle click on the issuet tracker icon. */
    issue_tracker : function() {
       window.open('http://projects.analytical-labs.com/projects/saiku/issues');
    },

    /** Handle click when the about button is clicked. */
    about : function() {
        view.show_view('views/info/index.html');
    }
    
};

/** Lazy load the rest of the javascript. */
$(document).ready(function() {

    $.getScript("js/saiku/src/puc.js");
    $.getScript("js/saiku/src/model.js",function() {
        $.ajax({
            type: "GET",
            cache: false,
            url: 'config/config.json',
            dataType: "json",
            success: function (data, textStatus, XMLHttpRequest) {
                model.username = data['username'];
                model.password = data['password'];
                TOMCAT_WEBAPP = data['saiku-webapp'];
                BASE_URL = data['saiku-ui-base'];
                PLUGIN = data['plugin'];
                REST_MOUNT_POINT = data['saiku-rest-mountpoint'];
                $.getScript("js/saiku/src/i18n.js");
                $.getScript("js/saiku/src/tabs.js", function() {
                    $.getScript("js/saiku/src/view.js");
                });
            }
        });
    });
    
   
    
});
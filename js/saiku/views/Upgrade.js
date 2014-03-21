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
 * The global toolbar
 */
var Upgrade = Backbone.View.extend({
    tagName: "div",
    
    events: {
        'click .upgradeheader' : 'call'
    },
    
    template: function() {
        var template = $("#template-upgrade").html() || "";

        return _.template(template)();
    },
    
    initialize: function() {

    },
    
    render: function() {
        if (!Settings.UPGRADE)
            return this;

        var timeout = Saiku.session.upgradeTimeout;
        var localStorageUsed = false;
        var first = true;
        if (typeof localStorage !== "undefined" && localStorage) {
            if (localStorage.getItem("saiku.upgradeTimeout") !== null) {
                timeout = localStorage.getItem("saiku.upgradeTimeout");
            }
            localStorageUsed = true;
        }

        var current = (new Date()).getTime();
        if (!timeout || (current - timeout) > (10 * 60 * 1000)) {
            $(this.el).html(this.template());
            Saiku.session.upgradeTimeout = current;
            if (typeof localStorage !== "undefined" && localStorage) {
                localStorage.setItem("saiku.upgradeTimeout", current);
            }
        }
        

        return this;
    },
    
    call: function(e) {
        $(".upgradeheader").slideUp("slow");
    }

});

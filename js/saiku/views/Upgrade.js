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
        this.render();

    },
    
    render: function() {
        $(this.el).html(this.template());

        return this;
    },
    
    call: function(e) {
        $(".upgradeheader").slideUp("slow");
        setTimeout("showIt()",15000);
    }

});

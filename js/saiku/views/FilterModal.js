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
 * The "add a folder" dialog
 */
var FilterModal = Modal.extend({

    type: "filter",
    closeText: "Save",

    events: {
        'submit form': 'save',
        'click .dialog_footer a:' : 'call',
    },

    buttons: [
        { text: "OK", method: "save" },
        { text: "Cancel", method: "close" }
    ],

    message: "<form id='custom_filter'>"
                     + "<table border='0px'>"
                     + "<tr><td class='col1'>Filter MDX Expression:</td></tr>"
                     + "<tr><td class='col1'><textarea class='filter_expression'></textarea></td></tr>"
                     + "</table></form>",


    
    
    
    filterCondition: "",
    

    initialize: function(args) {
        var self = this;
        this.axis = args.axis;
        this.query = args.query;
        this.success = args.success;
        this.filterCondition = args.filterCondition;
        _.bindAll(this, "save");

        _.extend(this.options, {
            title: "Custom Filter for " + this.axis
        });

        this.bind( 'open', function( ) {
                    $(this.el).find('textarea').val('').val(self.filterCondition);    
        });
        

        
        // fix event listening in IE < 9
        if($.browser.msie && $.browser.version < 9) {
            $(this.el).find('form').on('submit', this.save);    
        }

    },


    save: function( event ) {
        event.preventDefault( );
        var self = this;
        this.filterCondition = $(this.el).find('textarea').val();

        var alert_msg = "";
        if (typeof this.filterCondition == "undefined" || !this.filterCondition || this.filterCondition == "") {
            alert_msg += "You have to enter a MDX expression for the filter function! ";
            alert(alert_msg);
        } else {
            self.success(this.filterCondition);
            this.close();    
        }
        
        return false;
    },

    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    }


});

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
var StringFilterModal = Modal.extend({

    type: "filter",
    closeText: "Save",

    events: {
        //'submit form': 'save',
        'click .dialog_footer a' : 'call',
        'click .insert-member' : 'open_select_member_selector'
    },

    buttons: [
        { text: "OK", method: "save" },
        { text: "Cancel", method: "close" },
        { text: "Help", method: "help" }
    ],

    message: "",

    expression_text: function() {
        var c = "<form class='form-group-inline' data-action='cad' id='custom_filter'><table border='0px'>";

        c += "<tr><td class='col1'><label>Select Level:<select class='levellist'></select></label></td></tr>" +
             "<tr><td class='col1'><label>Match Type:<select class='match_type'>" +
             "<option value='contains'>Contains</option>" +
             "<option value='notcontains'>Does Not Contain</option>" +
             "<option value='begins'>Begins</option>" +
             "<option value='ends'>Ends</option>" +
             "</select></label></td></tr>" +
             "<tr><td class='col1'><label>Match Text:<input class='text_input'/></label></td></tr>" +
             "</table>" +
             "</form>";
        return c;
    },

    expression: " ",
    expressonType: "",
    

    initialize: function(args) {
        var self = this;
        this.id = _.uniqueId('match-modal-');
        this.workspace = args.workspace;
        this.axis = args.axis;
        this.query = args.query;
        this.success = args.success;
        this.expression = args.expression;
        this.expressionType = args.expressionType;
        _.bindAll(this, "save", "expression_text");

        _.extend(this.options, {
            title: "Custom " + this.expressionType + " for " + this.axis
        });

        this.message = this.expression_text(this.expressionType);

        this.bind( 'open', function( ) {
            this.populate_select();
        });
        

        
        // fix event listening in IE < 9
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);    
        }

    },

    populate_select: function(){
        var axis = this.workspace.query.helper.getAxis(this.axis);

        $(axis.hierarchies).each(function(i, el) {

            $(el.levels).each(function(j, el2){
                var option = '';
                for(var key in el2) {
                    console.log(el.name + ".[" + key + "]");
                 option += '<option>'+el.name + ".[" + key + "]"+'</option>';
                }
                $(".levellist").append(option);
            });
        });
    },

    save: function( event ) {
        event.preventDefault( );
        var self = this;
        this.expression = $(this.el).find('.text_input').val();
        this.member = $(this.el).find('.levellist').find(":selected").text();;
        var alert_msg = "";
        if (typeof this.expression == "undefined" || !this.expression || this.expression === "") {
            alert_msg += "You have to enter a MDX expression for the " + this.expressionType + " function! ";
            alert(alert_msg);
        } else {
            if (self.expressionType == "Order") {
                var sortOrder = $('#fun').val();
                self.success(sortOrder, this.expression);
            } else {
                self.success(this.member, null, this.expression);
            }
            this.close();    
        }
        
        return false;
    },

    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    },

    help: function(){
        //TODO LINK TO PAGE
        window.open("http://wiki.meteorite.bi");
    }


});

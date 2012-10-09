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
 * Dialog for member selections
 */
var SelectionsModal = Modal.extend({
    type: "selections",

    buttons: [
        { text: "OK", method: "save" },
        { text: "Cancel", method: "close" }
    ],
    
    events: {
        'click a': 'call',
        'change #show_unique': 'show_unique_action',
        'dblclick select option' : 'click_move_selection'
    },    

    show_unique_option: false,
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = "Selections for " + this.name;
        this.message = "Fetching members...";
        this.query = args.workspace.query;

        _.bindAll(this, "fetch_members", "populate", "finished");
        // Bind selection handlers
        _.extend(this.events, {
            'click div.selection_buttons a.form_button': 'move_selection'
        });
        
        // Determine axis
        this.axis = "undefined"; 
        if (args.target.parents('.fields_list_body').hasClass('rows')) { 
            this.axis = "ROWS";
        }
        if (args.target.parents('.fields_list_body').hasClass('columns')) { 
            this.axis = "COLUMNS";
        }
        if (args.target.parents('.fields_list_body').hasClass('filter')) { 
            this.axis = "FILTER";
        }
        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();
        
        $(this.el).parent().find('.ui-dialog-titlebar-close').bind('click',this.finished);
        // Fetch available members
        this.member = new Member({}, {
            cube: args.workspace.selected_cube,
            dimension: args.key
        });
        this.member.fetch({
            success: this.fetch_members
        });
    },
    
    fetch_members: function(model, response) {
        this.available_members = response;

        this.workspace.query.action.get("/axis/" + this.axis + "/", { 
            success: this.populate 
        });
    },
    
    populate: function(model, response) {

            // Load template
            $(this.el).find('.dialog_body')
                .html(_.template($("#template-selections").html())(this));
            
            this.selected_members = _.detect(response, function(obj) {
                return obj.name == this.member.dimension;
            }, this).selections;
            var used_members = [];
    
            // Populate both boxes
            $(this.el).find('.used_selections select').removeAttr('disabled');
            var selected_members_opts = "";
            for (var j = 0; j < this.selected_members.length; j++) {
                var member = this.selected_members[j];
                if (member.levelUniqueName == this.member.level &&
                    member.type == "MEMBER") {
                    selected_members_opts += "<option value='" + escape(member.uniqueName) + "'>" + member.caption + "</option>";
                    used_members.push(member.caption);
                }
            }
            if (used_members.length > 0) {
                $(selected_members_opts).appendTo($(this.el).find('.used_selections select'));
            }
            
            // Filter out used members
            this.available_members = _.select(this.available_members, function(obj) {
                return used_members.indexOf(obj.caption) === -1;
            });
            
            $(this.el).find('.available_selections select').removeAttr('disabled');
            var available_members_opts = "";
            for (var i = 0; i < this.available_members.length; i++) {
                var member = this.available_members[i];
                available_members_opts += "<option value='" + escape(member.uniqueName) + "'>" + member.caption + "</option>";
            }
            if (this.available_members.length > 0) {
                $(available_members_opts).appendTo($(this.el).find('.available_selections select'));
            }
            var self = this;
            $(this.el).find('.filterbox').autocomplete({
                    minLength: 1,
                    source: function(request, response ) {
                        response( $.map( self.available_members, function( item ) {
                                        if (item.caption.toLowerCase().indexOf(request.term.toLowerCase()) > -1) {
                                            return {
                                                label: item.caption ,
                                                value: item.uniqueName
                                            };
                                        }
                                }));
                    },
                    select:  function(event, ui) { 
                        var value = self.show_unique_option == false? escape(ui.item.value) : ui.item.label;
                        $(self.el).find('.available_selections select option[value="' + value + '"]')
                            .appendTo($(self.el).find('.used_selections select'));
                        $('#filter_selections').val('');

                    }, close: function(event, ui) { 
                        $('#filter_selections').val('');
                    }


                }).data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a class='label'>" + item.label + "</a><br><a class='description'>" + item.value + "</a>" )
                    .appendTo( ul );
                };
		// Translate
		Saiku.i18n.translate();
        // Show dialog
        Saiku.ui.unblock();
    },
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "800px", left: "inherit", margin:"0 auto" });
    },
    
    move_selection: function(event) {
        var action = $(event.target).attr('id');
        var $to = action.indexOf('add') !== -1 ? 
            $(this.el).find('.used_selections select') :
            $(this.el).find('.available_selections select');
        var $from = action.indexOf('add') !== -1 ? 
            $(this.el).find('.available_selections select') :
            $(this.el).find('.used_selections select');
        var $els = action.indexOf('all') !== -1 ? 
            $from.find('option') :$from.find('option:selected');
        $els.detach().appendTo($to);
    },

    click_move_selection: function(event, ui) {
      var to = ($(event.target).parent().parent().hasClass('used_selections')) ? '.available_selections' : '.used_selections';
      $(event.target).appendTo($(this.el).find(to +' select'));
    },

    show_unique_action: function() {
        $.each($(this.el).find('option'), function(i, option) {
            var text = $(option).text();
            $(option).text(unescape($(option).val()));
            $(option).val(escape(text));
        });
        this.show_unique_option= ! this.show_unique_option;
    },
    
    save: function() {
        // Notify user that updates are in progress
        var $loading = $("<div>Saving...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);
        var show_u = this.show_unique_option;

        // Determine updates
        var updates = [{
            hierarchy: this.member.hierarchy,
            uniquename: this.member.level,
            type: 'level',
            action: 'delete'
        }];
        
        // If no selections are used, add level
        if ($(this.el).find('.used_selections option').length === 0) {
            updates.push({
                hierarchy: this.member.hierarchy,
                uniquename: this.member.level,
                type: 'level',
                action: 'add'
            });
        } else {
            // Loop through selections
            $(this.el).find('.used_selections option')
                .each(function(i, selection) {
                var value = show_u ? 
                    $(selection).text() : unescape($(selection).val());
                updates.push({
                    uniquename: value,
                    type: 'member',
                    action: 'add'
                });
            });
        }
        
        // Notify server
        this.query.action.put('/axis/' + this.axis + '/dimension/' + this.member.dimension, { 
            success: this.finished,
            data: {
                selections: JSON.stringify(updates)
            }
        });
        
        return false;
    },
    
    finished: function() {
        $('#filter_selections').remove();
        this.available_members = null;
        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});

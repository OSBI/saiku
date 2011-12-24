/*
 * SelectionsModal.js
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
 * Dialog for member selections
 */
var SelectionsModal = Modal.extend({
    type: "selections",

    buttons: [
        { text: "Save", method: "save" },
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
                    selected_members_opts += "<option value='" + member.uniqueName + "'>" + member.caption + "</option>";
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
                available_members_opts += "<option value='" + member.uniqueName + "'>" + member.caption + "</option>";
            }
            if (this.available_members.length > 0) {
                $(available_members_opts).appendTo($(this.el).find('.available_selections select'));
            }

        // Show dialog
        Saiku.ui.unblock();
    },
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "500px" });
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
            $(option).text($(option).val());
            $(option).val(text);
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
                    $(selection).text() : $(selection).val();
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
        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});

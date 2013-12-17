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
        'click .search_term' : 'search_members',
        'click .clear_search' : 'clear_search',
        'change #show_unique': 'show_unique_action',
        'change #use_result': 'use_result_action',
        'dblclick select option' : 'click_move_selection',
        'click div.selection_buttons a.form_button': 'move_selection',
        'click div.updown_buttons a.form_button': 'updown_selection'
    },    

    show_unique_option: false,

    use_result_option: Settings.MEMBERS_FROM_RESULT,
    members_limit: Settings.MEMBERS_LIMIT,
    members_search_limit: Settings.MEMBERS_SEARCH_LIMIT,
    members_search_server: false,
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = "<span class='i18n'>Selections for</span> " + this.name;
        this.message = "Fetching members...";
        this.query = args.workspace.query;
        this.selected_members = [];
        this.available_members = [];

        _.bindAll(this, "fetch_members", "populate", "finished", "get_members", "use_result_action");
        
        // Determine axis
        this.axis = "undefined"; 
        if (args.axis) {
            this.axis = args.axis;
            if (args.axis == "FILTER") {
                this.use_result_option = false;
            }
        } else {
            if (args.target.parents('.fields_list_body').hasClass('rows')) { 
                this.axis = "ROWS";
            }
            if (args.target.parents('.fields_list_body').hasClass('columns')) { 
                this.axis = "COLUMNS";
            }
            if (args.target.parents('.fields_list_body').hasClass('filter')) { 
                this.axis = "FILTER";
                this.use_result_option = false;
            }
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

        // Load template
        $(this.el).find('.dialog_body')
            .html(_.template($("#template-selections").html())(this));
        
        $(this.el).find('#use_result').attr('checked', this.use_result_option);
        $(this.el).find('.search_limit').text(this.members_search_limit);
        $(this.el).find('.members_limit').text(this.members_limit);


        this.get_members();
    },

    get_members: function() {
            var self = this;
            var path = "/result/metadata/dimensions/" + this.member.dimension + "/hierarchies/" + this.member.hierarchy + "/levels/" + this.member.level;
            this.search_path = path;
            
            var message = '<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">' + self.message + '</span> ';
            self.workspace.block(message);

            this.workspace.query.action.get(path, { 
                success: this.fetch_members, 
                error: function() {
                    self.workspace.unblock();
                },
                data: {result: this.use_result_option, searchlimit: this.members_limit }});
    },

    clear_search: function() {
        $(this.el).find('.filterbox').val('');
        this.get_members();
    },

    search_members: function() {
        var self = this;
        var search_term = $(this.el).find('.filterbox').val();
        if (!search_term) 
            return false;

        var message = '<span class="processing_image">&nbsp;&nbsp;</span> <span class="i18n">Searching for members matching:</span> ' + search_term;
        self.workspace.block(message);

        self.workspace.query.action.get(self.search_path, { 
                async: false, 
                success: function(response, model) {
                                if (model && model.length > 0) {
                                    self.available_members = model;
                                }
                                self.populate();
                            }, 
                error: function () {
                    self.workspace.unblock();
                },
                data: { search: search_term, searchlimit: self.members_search_limit }
        });


    },
    
    fetch_members: function(model, response) {
        var self = this;
        if (response && response.length > 0) {
            this.available_members = response;
        }

        this.workspace.query.action.get("/axis/" + this.axis + "/dimension/" + this.member.dimension, { 
            success: this.populate,
            error: function() {
                self.workspace.unblock();
            }
        });
    },
    
    populate: function(model, response) {
            var self = this;
            self.workspace.unblock();
            this.members_search_server = (this.available_members.length >= this.members_limit || this.available_members.length == 0);

            $(this.el).find('.items_size').text(this.available_members.length);
            if (this.members_search_server) {
                $(this.el).find('.warning').text("More items available than listed. Pre-Filter on server.");
            } else {
                $(this.el).find('.warning').text("");
            }

            if (response && response.hasOwnProperty('selections')) {
                this.selected_members = response.selections;
            }
            var used_members = [];
    
            // Populate both boxes
            $(this.el).find('.used_selections select').removeAttr('disabled');
            var selected_members_opts = "";
            for (var j = 0; j < this.selected_members.length; j++) {
                var member = this.selected_members[j];
                if (member.levelUniqueName == decodeURIComponent(this.member.level) && 
                    member.type == "MEMBER") {
                    selected_members_opts += '<option value="' + encodeURIComponent(member.uniqueName) + '">' + member.caption + "</option>";
                    used_members.push(member.caption);
                }
            }
            if (used_members.length > 0) {
                var selectedMembers = $(this.el).find('.used_selections select');
                selectedMembers.empty();
                $(selected_members_opts).appendTo(selectedMembers);
            }
            
            // Filter out used members
            this.available_members = _.select(this.available_members, function(obj) {
                return used_members.indexOf(obj.caption) === -1;
            });
            
            $(this.el).find('.available_selections select').removeAttr('disabled');
            var available_members_opts = "";
            for (var i = 0; i < this.available_members.length; i++) {
                var member = this.available_members[i];
                available_members_opts += '<option value="' + encodeURIComponent(member.uniqueName) + '">' + member.caption + "</option>";
            }
            if (this.available_members.length > 0) {
                var availableMembersSelect = $(this.el).find('.available_selections select');
                availableMembersSelect.empty();
                $(available_members_opts).appendTo(availableMembersSelect);
            }
            
            $(this.el).find('.filterbox').autocomplete({
                    minLength: 1, //(self.members_search_server ? 2 : 1),
                    delay: 200, //(self.members_search_server ? 400 : 300),
                    appendTo: ".autocomplete",
                    source: function(request, response ) {
                        var searchlist = self.available_members;
                        /*
                            if (false && self.members_search_server) {
                                self.workspace.query.action.get(self.search_path, { async: false, success: function(response, model) {
                                    searchlist = model;
                                }, data: { search: request.term, searchlimit: self.members_search_limit }});

                                response( $.map( searchlist, function( item ) {
                                    return {
                                                        label: item.caption ,
                                                        value: item.uniqueName
                                    };
                                }));

                            } else {
                            */
                            var search_target = self.show_unique_option == false ? "caption" : "name";
                            var result =  $.map( searchlist, function( item ) {

                                            if (item[search_target].toLowerCase().indexOf(request.term.toLowerCase()) > -1) {
                                                var label = self.show_unique_option == false? item.caption : item.uniqueName;
                                                var value = self.show_unique_option == false? item.uniqueName : item.caption;
                                                

                                                return {
                                                    label: label,
                                                    value: value
                                                };
                                            }
                                    });
                            response( result);
                    },
                    select:  function(event, ui) { 
                        var value = encodeURIComponent(ui.item.value);
                        var label = ui.item.label;

                        $(self.el).find('.available_selections select option[value="' + value + '"]').remove();
                        $(self.el).find('.used_selections select option[value="' + value + '"]').remove();
                        var option = '<option value="' + value + '">' + label + "</option>";
                        
                        $(option).appendTo($(self.el).find('.used_selections select'));
                        $(self.el).find('.filterbox').val('');
                        ui.item.value = "";

                    }, close: function(event, ui) { 
                        //$('#filter_selections').val('');
                        //$(self.el).find('.filterbox').css({ "text-align" : " left"});
                    }, open: function( event, ui ) {
                        //$(self.el).find('.filterbox').css({ "text-align" : " right"});

                    }
                });

            $(this.el).find('.filterbox').autocomplete("enable");

		// Translate
		Saiku.i18n.translate();
        // Show dialog
        Saiku.ui.unblock();
    },
    
    post_render: function(args) {
        var left = ($(window).width() - 1000)/2;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: 1040, left: "inherit", margin:"0", height: 465 })
            .offset({ left: left});
    },
    
    move_selection: function(event) {
        event.preventDefault();
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

    updown_selection: function(event) {
        event.preventDefault();
        var action = $(event.target).attr('href').replace('#','');
        if (typeof action != "undefined") {
            if ("up" == action) {
                $(this.el).find('.used_selections option:selected').insertBefore( $('.used_selections option:selected:first').prev());
            } else if ("down" == action) {
                $(this.el).find('.used_selections option:selected').insertAfter( $('.used_selections option:selected:last').next());
            }

        }
    },

    click_move_selection: function(event, ui) {
      var to = ($(event.target).parent().parent().hasClass('used_selections')) ? '.available_selections' : '.used_selections';
      $(event.target).appendTo($(this.el).find(to +' select'));
    },

    show_unique_action: function() {
        $.each($(this.el).find('option'), function(i, option) {
            var text = $(option).text();
            $(option).text(decodeURIComponent($(option).val()));
            $(option).val(encodeURIComponent(text));
        });
        this.show_unique_option= ! this.show_unique_option;
    },

    use_result_action: function() {
        this.use_result_option = !this.use_result_option;
        //console.log(this.use_result_option);
        this.get_members();
    },

    
    save: function() {
        // Notify user that updates are in progress
        var $loading = $("<div>Saving...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);
        var show_u = this.show_unique_option;

        // Determine updates
        var updates = [{
            hierarchy: decodeURIComponent(this.member.hierarchy),
            uniquename: decodeURIComponent(this.member.level),
            type: 'level',
            action: 'delete'
        }];
        
        // If no selections are used, add level
        if ($(this.el).find('.used_selections option').length === 0) {
            updates.push({
                hierarchy: decodeURIComponent(this.member.hierarchy),
                uniquename: decodeURIComponent(this.member.level),
                type: 'level',
                action: 'add'
            });
        } else {
            // Loop through selections
            $(this.el).find('.used_selections option')
                .each(function(i, selection) {
                var value = show_u ? 
                    encodeURIComponent($(selection).text()) : $(selection).val();
                updates.push({
                    uniquename: decodeURIComponent(value),
                    type: 'member',
                    action: 'add'
                });
            });
        }
        
        // Notify server
        this.query.action.put('/axis/' + this.axis + '/dimension/' + this.member.dimension, { 
            success: this.finished,
            dataType: "text",
            data: {
                selections: JSON.stringify(updates)
            }
        });
        
        return false;
    },
    
    finished: function() {
        $('#filter_selections').remove();
        this.available_members = null;
        $(this.el).find('.filterbox').autocomplete('destroy');
        $(this.el).dialog('destroy');
        $(this.el).remove();
        this.query.run();
    }
});

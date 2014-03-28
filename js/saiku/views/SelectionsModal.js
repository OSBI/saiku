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
        'dblclick .selection_options li label' : 'click_move_selection'
        //,'click div.updown_buttons a.form_button': 'updown_selection'
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

        if (Settings.ALLOW_PARAMETERS) {
            var hName = this.member.hierarchy;
            var lName = this.member.level;
            var hierarchy = this.workspace.query.helper.getHierarchy(hName);
            var pName = null;
            if (hierarchy && hierarchy.levels.hasOwnProperty(lName)) {
                pName = hierarchy.levels[lName].selection ? hierarchy.levels[lName].selection.parameterName : null;
            }

            $(this.el).find('.parameter').removeClass('hide');
            if (pName) {
                $(this.el).find('input.parameter').val(pName);
            }
        }
        
        $(this.el).find('#use_result').attr('checked', this.use_result_option);
        $(this.el).find('.search_limit').text(this.members_search_limit);
        $(this.el).find('.members_limit').text(this.members_limit);


        this.get_members();
    },

    get_members: function() {
            var self = this;
            var path = "/result/metadata/hierarchies/" + encodeURIComponent(this.member.hierarchy) + "/levels/" + encodeURIComponent(this.member.level);
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
        this.populate();
    },
    
    populate: function(model, response) {
            var self = this;
            self.workspace.unblock();
            this.members_search_server = (this.available_members.length >= this.members_limit || this.available_members.length == 0);

            self.show_unique_option = false;
            $(this.el).find('.options #show_unique').attr('checked',false);

            $(this.el).find('.items_size').text(this.available_members.length);
            if (this.members_search_server) {
                $(this.el).find('.warning').text("More items available than listed. Pre-Filter on server.");
            } else {
                $(this.el).find('.warning').text("");
            }

            var hName = self.member.hierarchy;
            var lName = self.member.level;
            var hierarchy = self.workspace.query.helper.getHierarchy(hName);
            if (hierarchy && hierarchy.levels.hasOwnProperty(lName)) {
                this.selected_members = hierarchy.levels[lName].selection ? hierarchy.levels[lName].selection.members : [];
            }
            var used_members = [];
    
            // Populate both boxes
            
            
            for (var j = 0, len = this.selected_members.length; j < len; j++) {
                    var member = this.selected_members[j];
                    used_members.push(member.caption);
            }
            if (used_members.length > 0) {
                var selectedMembers = $(this.el).find('.used_selections .selection_options');
                selectedMembers.empty();
                var selectedHtml = _.template($("#template-selections-options").html())({ options: this.selected_members });
                $(selectedMembers).html(selectedHtml);
            }
            
            // Filter out used members
            this.available_members = _.select(this.available_members, function(obj) {
                return used_members.indexOf(obj.caption) === -1;
            });
            
            if (this.available_members.length > 0) {
                var availableMembersSelect = $(this.el).find('.available_selections .selection_options');
                availableMembersSelect.empty();
                var selectedHtml = _.template($("#template-selections-options").html())({ options: this.available_members });
                $(availableMembersSelect).html(selectedHtml);   
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
                        var searchVal = self.show_unique_option == false? ui.item.value : ui.item.label;
                        var cap = self.show_unique_option == false? ui.item.label : ui.item.value;

                        $(self.el).find('.available_selections .selection_options input[value="' + encodeURIComponent(searchVal) + '"]').parent().remove();
                        $(self.el).find('.used_selections .selection_options input[value="' + encodeURIComponent(searchVal) + '"]').parent().remove();

                        var option = '<li class="option_value"><input type="checkbox" class="check_option" value="' 
                                            +  encodeURIComponent(searchVal) + '" label="' + encodeURIComponent(cap)  + '">' + label + '</input></li>';
            

                        
                        
                        
                        $(option).appendTo($(self.el).find('.used_selections .selection_options ul'));
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
        var width = $(window).width() < 1040 ? $(window).width() : 1040;
        $(args.modal.el).parents('.ui-dialog')
            .css({ width: width, left: "inherit", margin:"0", height: 485 })
            .offset({ left: left});
    },
    
    move_selection: function(event) {
        event.preventDefault();
        var action = $(event.target).attr('id');
        var $to = action.indexOf('add') !== -1 ? 
            $(this.el).find('.used_selections .selection_options ul') :
            $(this.el).find('.available_selections .selection_options ul');
        var $from = action.indexOf('add') !== -1 ? 
            $(this.el).find('.available_selections .selection_options ul') :
            $(this.el).find('.used_selections .selection_options ul');
        var $els = action.indexOf('all') !== -1 ? 
            $from.find('input').parent() : $from.find('input:checked').parent();
        $els.detach().appendTo($to);
        $(this.el).find('.selection_options ul input:checked').attr('checked', false);
    },

    updown_selection: function(event) {
        event.preventDefault();
        return false;
        /*
        var action = $(event.target).attr('href').replace('#','');
        if (typeof action != "undefined") {
            if ("up" == action) {
                $(this.el).find('.used_selections option:selected').insertBefore( $('.used_selections option:selected:first').prev());
            } else if ("down" == action) {
                $(this.el).find('.used_selections option:selected').insertAfter( $('.used_selections option:selected:last').next());
            }

        }
        */
    },

    click_move_selection: function(event, ui) {
      event.preventDefault();
      var to = ($(event.target).parent().parent().parent().parent().hasClass('used_selections')) ? '.available_selections' : '.used_selections';
      $(event.target).parent().appendTo($(this.el).find(to +' .selection_options ul'));
    },

    show_unique_action: function() {
        var self = this;
        this.show_unique_option= ! this.show_unique_option;

        if(this.show_unique_option === true) {
            $(this.el).find('.available_selections, .used_selections').addClass('unique');
            $(this.el).find('.available_selections, .used_selections').removeClass('caption');
        } else {
            $(this.el).find('.available_selections, .used_selections').addClass('caption');
            $(this.el).find('.available_selections, .used_selections').removeClass('unique');
        }

    },

    use_result_action: function() {
        this.use_result_option = !this.use_result_option;
        //console.log(this.use_result_option);
        this.get_members();
    },

    
    save: function() {
        var self = this;
        // Notify user that updates are in progress
        var $loading = $("<div>Saving...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);
        var show_u = this.show_unique_option;

        var hName = decodeURIComponent(self.member.hierarchy);
        var lName = decodeURIComponent(self.member.level)
        var hierarchy = self.workspace.query.helper.getHierarchy(hName);
        

        // Determine updates
        var updates = [];
        
        // If no selections are used, add level
        if ($(this.el).find('.used_selections input').length === 0) {
            // nothing to do - include all members of this level
        } else {
            // Loop through selections
            $(this.el).find('.used_selections input')
                .each(function(i, selection) {
                var value = $(selection).val();
                var caption = $(selection).attr('label');
                updates.push({
                    uniqueName: decodeURIComponent(value),
                    caption: decodeURIComponent(caption)
                });
            });
        }

        
        var parameterName = $('#parameter').val();
        if (hierarchy && hierarchy.levels.hasOwnProperty(lName)) {
                hierarchy.levels[lName].selection = { "type": "INCLUSION", "members": updates };
                if (Settings.ALLOW_PARAMETERS && parameterName) {
                    hierarchy.levels[lName].selection["parameterName"] = parameterName;
                    var parameters = self.workspace.query.helper.model().parameters;
                    if (!parameters[parameterName]) {
                    //    self.workspace.query.helper.model().parameters[parameterName] = "";
                    }
                }

        }


        this.finished();
    },
    
    finished: function() {
        $('#filter_selections').remove();
        this.available_members = null;
        $(this.el).find('.filterbox').autocomplete('destroy').remove();
        $(this.el).dialog('destroy');
        $(this.el).remove();
        this.query.run();
    }
});

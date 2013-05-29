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
 * Controls the appearance and behavior of the dimension list
 * 
 * This is where drag and drop lives
 */
var DimensionList = Backbone.View.extend({
    events: {
        'click span': 'select',
        'click a': 'select',
        'click .parent_dimension ul li a' : 'select_dimension',
        'click .measure' : 'select_measure'
    },
    
    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "render", "load_dimension","select_dimension");
        
        // Bind parent element
        this.workspace = args.workspace;
        this.dimension = args.dimension;
        
        // Fetch from the server if we haven't already
        if (args.dimension && args.dimension.has('template')) {
            this.load_dimension();
        } else if (! args.dimension){
            $(this.el).html('Could not load dimension. Please log out and log in again.');
        } else {
            $(this.el).html('Loading...');
            args.dimension.fetch({ success: this.load_dimension });
        }
    },
    
    load_dimension: function() {
        this.template = this.dimension.get('template');
        this.render(); 
        this.workspace.trigger('dimensions:loaded', $(this.el));

    },
    
    render: function() {
        // Pull the HTML from cache and hide all dimensions
        var self = this;
        $(this.el).hide().html(this.template);
        if (isIE && isIE <= 8) {
            $(this.el).show();
        } else {
            $(this.el).fadeTo(500,1);
        }
        
        // Add draggable behavior
        $(this.el).find('.measure,.level').parent('li').mousedown(function(event, ui) {
            event.preventDefault();
            if ($(event.target).parent().hasClass('ui-state-disabled')) {
                return;
            }
            if (self.workspace.query.get('type') == "QM") {
                if ( $(self.workspace.toolbar.el).find('.toggle_fields').hasClass('on') && $(self.workspace.el).find('.workspace_editor').is(':hidden')) {
                    self.workspace.toolbar.toggle_fields();
                }
            }
        });
        $(this.el).find('.measure,.level').parent('li').draggable({
            cancel: '.not-draggable, .hierarchy',
            connectToSortable: $(this.workspace.el)
                .find('.columns > ul, .rows > ul, .filter > ul'),
            helper: 'clone',
            opacity: 0.60,
            tolerance: 'touch',
            stop: function() {
                if (self.workspace.query.get('type') == "QM") {
                    if ( $(self.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
                        self.workspace.toolbar.toggle_fields();
                    }
                }
            },
            cursorAt: {
                top: 10,
                left: 35
            }
        });
    },
    
    select: function(event) {
        var $target = $(event.target).hasClass('root')
            ? $(event.target) : $(event.target).parent().find('span');
        if ($target.hasClass('root')) {
            $target.find('a').toggleClass('folder_collapsed').toggleClass('folder_expand');
            $target.toggleClass('collapsed').toggleClass('expand');
            $target.parents('li').find('ul').children('li').toggle();
        }
        
        return false;
    },

     select_dimension: function(event, ui) {
        if (this.workspace.query.get('type') != "QM") {
            return;
        }
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        
        var isAlreadyOnAxis = false;
        var href = $(event.target).attr('href');
        var hierarchy = href.substring(0,_.lastIndexOf(href, "/"));
        if ($(this.workspace.el).find(".workspace_fields ul li a[href^='" + hierarchy + "']:first").length > 0) {
            $axis = $(this.workspace.el).find(".workspace_fields ul li a[href^='" + hierarchy + "']").parent().parent();
        } else {
            $axis = $(this.workspace.el).find(".columns ul li").length > 0 ?
                $(this.workspace.el).find(".rows ul") :
                $(this.workspace.el).find(".columns ul");
        }
        $target = $(event.target).parent().clone()
            .appendTo($axis);
        this.workspace.drop_zones.select_dimension({
            target: $axis
        }, {
            item: $target
        });

        if ( $(this.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
            $(this.workspace.el).find('.workspace_editor').delay(2000).slideUp({ complete: this.workspace.adjust });
        }
        event.preventDefault();
        return false;
    },

    select_measure: function(event, ui) {
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            return;
        }
        
        var $axis;
        if ($(this.workspace.el).find(".rows ul .d_measure").length > 0) $axis = $(this.workspace.el).find(".rows ul");
        else if ($(this.workspace.el).find(".columns ul .d_measure").length > 0) $axis = $(this.workspace.el).find(".columns ul");
        else if ($(this.workspace.el).find(".filter ul .d_measure").length > 0) $axis = $(this.workspace.el).find(".filter ul");
        else $axis = $(this.workspace.el).find(".columns ul");

        $target = $(event.target).parent().clone();
        if ($axis.find(".d_measure").length != 0)
            $target.insertAfter($axis.find(".d_measure:last"));
        else {
            $target.appendTo($axis);
        }
        this.workspace.drop_zones.select_dimension({
            target: $axis
        }, {
            item: $target
        });

        if ( $(this.workspace.toolbar.el).find('.toggle_fields').hasClass('on')) {
            $(this.workspace.el).find('.workspace_editor').delay(2000).slideUp({ complete: this.workspace.adjust });
        }
        event.preventDefault();
        return false;
    }
});

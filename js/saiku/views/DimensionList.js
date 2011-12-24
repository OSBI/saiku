/*
 * DimensionList.js
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
        $(this.el).html(this.template)
            .find('.hide').hide().removeClass('hide');
        
        // Add draggable behavior
        $(this.el).find('.measure,.dimension').parent('li').draggable({
            cancel: '.not-draggable, .hierarchy',
            connectToSortable: $(this.workspace.el)
                .find('.columns > ul, .rows > ul, .filter > ul'),
            helper: 'clone',
            opacity: 0.60,
            tolerance: 'pointer',
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
        if ($(event.target).parent().hasClass('ui-state-disabled')) {
            return;
        }
        
        $axis = $(this.workspace.el).find(".columns ul li").length > 0 ?
            $(this.workspace.el).find(".rows ul") :
            $(this.workspace.el).find(".columns ul");
        $target = $(event.target).parent().clone()
            .appendTo($axis);
        this.workspace.drop_zones.select_dimension({
            target: $axis
        }, {
            item: $target
        });
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
        return false;
    }
});

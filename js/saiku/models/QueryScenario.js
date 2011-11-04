/*
 * QueryScenario.js
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
var QueryScenario = Backbone.Model.extend({
    initialize: function(args, options) {
        // Maintain `this`
        _.bindAll(this, "attach_listeners", "clicked_cell", "save_writeback", 
            "cancel_writeback", "check_input");
        
        this.query = options.query;
        this.query.bind('table:render', this.attach_listeners);
    },
    
    attach_listeners: function(args) {
        if (args.workspace.query && args.workspace.query.properties &&
            args.workspace.query.properties.properties['org.saiku.connection.scenario'] === "true")
        $(args.workspace.el).find("td.data").click(this.clicked_cell);
    },
    
    clicked_cell: function(event) {
        $target = $(event.target).hasClass('data') ?
            $(event.target).find('div') : $(event.target);
        var value = $target.attr('alt');
                    var pos = $target.attr('rel');
        
        var $input = $("<input type='text' value='" + value + "' />")
            .keyup(this.check_input)
            .blur(this.cancel_writeback);
        $target.html('').append($input);
        $input.focus();
    },
    
    check_input: function(event) {
        if (event.which == 13) {
            this.save_writeback(event);
        } else if (event.which == 27 || event.which == 9) {
            this.cancel_writeback(event);
        }
         
        return false;
    },
    
    save_writeback: function(event) {
        var $input = $(event.target).closest('input');
        this.set({
            value: $input.val(),
            position: $input.parent().attr('rel')
        });
        this.save();
        var value = $input.val();
        $input.parent().text(value);
    },
    
    cancel_writeback: function(event) {
        var $input = $(event.target).closest('input');
        $input.parent().text($input.parent().attr('alt'));
    },
    
    parse: function() {
        this.query.run();
    },

    url: function() {
        return this.query.url() + "/cell/" + this.get('position') + 
            "/" + this.get('value'); 
    }
});

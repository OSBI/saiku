/*
 * SaveQuery.js
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
 * The save query dialog
 */
var SaveQuery = Modal.extend({
    type: "save",
    closeText: "Save",
    
    buttons: [
        { text: "OK", method: "save" }
    ],
    
    initialize: function(args) {
        // Append events
        this.events = _.extend(this.events, {
            'submit #save_query_form': 'save'
        });
        
        var name = args.query.name ? args.query.name : "";
        this.query = args.query;
        this.message = _.template("<form id='save_query_form'>" +
            "<label for='name'>To save a new query, " + 
            "please type a name in the text box below:</label><br />" +
            "<input type='text' name='name' value='<%= name %>' />" +
            "</form>")({ name: name });
        _.extend(this.options, {
            title: "Save query"
        });
        
        // Focus on query name
        $(this.el).find('input').select().focus();
        
        // Maintain `this`
        _.bindAll(this, "copy_to_repository", "close");
    },
    
    save: function(event) {
        // Save the name for future reference
        var name = $(this.el).find('input[name="name"]').val();
        this.query.set({ name: name });
        this.query.trigger('query:save');
        $(this.el).find('form').html("Saving query...");
        
        // Fetch query XML and save to repository
        this.query.action.get("/xml", {
            success: this.copy_to_repository
        });
        
        event.preventDefault();
        return false;
    },
    
    copy_to_repository: function(model, response) {
        (new SavedQuery({
            name: this.query.uuid,
            newname: this.query.get('name'),
            xml: response.xml
        })).save({ success: this.close });
    }
});

/*
 * DeleteQuery.js
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
 * The delete query confirmation dialog
 */
var DeleteRepositoryObject = Modal.extend({
    type: "delete",
    
    buttons: [
        { text: "Yes", method: "del" },
        { text: "No", method: "close" }
    ],
    
    initialize: function(args) {
        this.options.title = "Confirm deletion";
        this.query = args.query;
        this.success = args.success;
        this.message = _.template("Are you sure you want to delete <%= name %>?")
            ({ name: this.query.get('name') });
    },
    
    del: function() {
        this.query.id = _.uniqueId("query_");
        this.query.url = this.query.url() + "?file=" + this.query.get('file');
        this.query.destroy({
            success: this.success,
            error: this.error
        });
        this.close();
    },
    
    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not delete repository object");
    }
});

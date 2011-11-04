/*
 * AboutModal.js
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
 * The "about us" dialog
 */
var AboutModal = Modal.extend({
    initialize: function() {
        _.extend(this.options, {
            title: "About " + Settings.VERSION
        });
    },
    
    type: "info",
    
    message: Settings.VERSION + "<br>" + 
        "<a href='http://www.analytical-labs.com'>http://www.analytical-labs.com/</a>"
});

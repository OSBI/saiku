/*
 * Table.js
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
 * Class which handles table rendering of resultsets
 */
var Table = Backbone.View.extend({
    tagName: "table",
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data");
        this.workspace.bind('query:result', this.render);
    },
    
    render: function(args, block) {

        if (args.data.error != null) {
            return this.error(args);
        }

        
        // Check to see if there is data
        if (args.data.cellset && args.data.cellset.length === 0) {
            return this.no_results(args);
        }
        
        // Clear the contents of the table
        $(this.el).html('<tr><td>Rendering ' + args.data.width + ' columns and ' + args.data.height + ' rows...</td></tr>');

        // Render the table without blocking the UI thread
        if (block === true) {
            this.process_data(args.data.cellset);
        } else {
            _.delay(this.process_data, 0, args.data.cellset);
        }

    },
    
    process_data: function(data) {
        var contents = "";
        var table = data ? data : [];
        for (var row = 0; row < table.length; row++) {
            contents += "<tr>";
            for (var col = 0; col < table[row].length; col++) {
                var header = data[row][col];
                
                // FIXME - this needs to be cleaned up
                
                // If the cell is a column header and is null (top left of table)
                if (header.type === "COLUMN_HEADER" && header.value === "null") {
                    contents += '<th class="all_null"><div>&nbsp;</div></th>';
                } // If the cell is a column header and isn't null (column header of table)
                else if (header.type === "COLUMN_HEADER") {
                    contents += '<th class="col"><div>' + header.value + '</div></th>';
                } // If the cell is a row header and is null (grouped row header)
                else if (header.type === "ROW_HEADER" && header.value === "null") {
                    contents += '<th class="row_null"><div>&nbsp;</div></th>';
                } // If the cell is a row header and isn't null (last row header)
                else if (header.type === "ROW_HEADER") {
                    contents += '<th class="row"><div>' + header.value + '</div></th>';
                }
                else if (header.type === "ROW_HEADER_HEADER") {
                    contents += '<th class="row_header"><div>' + header.value + '</div></th>';
                } // If the cell is a normal data cell
                else if (header.type === "DATA_CELL") {
                    contents += '<td class="data"><div alt="' + header.properties.raw + '" rel="' + header.properties.position + '">' + header.value + '</div></td>';
                }
            }
            contents += "</tr>";
        }
        
        // Append the table
        $(this.el).html(contents);
        
    },
    
    no_results: function(args) {
        $(this.el).html('<tr><td>No results</td></tr>');
    },
    
    error: function(args) {
        $(this.el).html('<tr><td>' + args.data.error + '</td></tr>');
    }
});

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
    
    render: function(args) {

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
        _.delay(this.process_data, 0, args.data.cellset);
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
                    contents += '<td class="data"><div>' + header.value + '</div></td>';
                }
            }
            contents += "</tr>";
        }
        
        // Append the table
        $(this.el).html(contents);
    },
    
    no_results: function(args) {
        $(args.workspace.el).find('.workspace_results table')
            .html('<tr><td>No results</td></tr>');
    },
    
    error: function(args) {
        $(args.workspace.el).find('.workspace_results table')
            .html('<tr><td>' + args.data.error + '</td></tr>');
    }
});
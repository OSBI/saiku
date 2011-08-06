/* Saiku UI -- a user interface for the Saiku Server
    Copyright (C) Paul Stoellberger, 2011.

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 3 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General
    Public License along with this library; if not, write to the
    Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
    Boston, MA 02110-1301 USA
 */
/**
 * @fileOverview    This represents the model for Saiku UI.
 * @description     This will handle all interaction to Saiku's REST API.
 * @version         1.0.0
 */

/**
 * Model class
 * @class
 */
var run = {

    /** Username to be used with BASIC_AUTH. */
    username: "",

    /** Password to be used with BASIC_AUTH. */
    password: "",
    
    /**
	 * Handle all AJAX requests.
	 * @param paramters {Object} Parameters for AJAX requests.
	 */
    request: function (parameters) {
        // Overwrite defaults with incoming parameters
        settings = $.extend({
            method: "GET",
            data: {},
            contentType: 'application/x-www-form-urlencoded',
            success: function () {},
            error: function () {
                view.show_dialog('Error', 'Could not connect to the server, please check your internet connection. ' + 'If this problem persists, please refresh the page.', 'error');
            },
            dataType: "json"
        }, parameters);

        // Make ajax request
        $.ajax({
            type: settings.method,
            cache: false,
            url: TOMCAT_WEBAPP + REST_MOUNT_POINT + encodeURI(parameters.url),
            dataType: settings.dataType,
            username: run.username,
            password: run.password,
            success: settings.success,
            error: settings.error,
            data: settings.data,
            contentType: settings.contentType
        });
    },

    /**
	 * Generate a new query_id
	 * @param tab_index {Integer} Index of the selected tab.
	 * @return A new unique query_id
	 */
    generate_query_id: function () {
        queryid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },

    /**
	 * Populate the dimension and measure tree and initialise draggable,
	 * droppable and sortable items.
	 * @param tab_index {Integer} Index of the selected tab.
	 */
    new_query: function (queryid,xml,callback) {

        // Generate the temporary query name
        run.generate_query_id();

        run.show_processing('Executing query. Please wait...');

       
            // Open existing query
            var post_data = {
                'xml': xml
            };

        // Get a list of available dimensions and measures.
        run.request({
            method: "POST",
            url: run.username + "/query/" + queryid + "/",

            data: post_data,

            success: function (query_data, textStatus, XMLHttpRequest) {
                callback();
            },

            error: function () {
                // Could not retrieve dimensions and measures from server
                run.hide_processing();
                run.show_dialog("Error", "Couldn't create a new query. Please try again.", "error");
            }
        });
    },



    /**
	 * Run the query (triggered by drag events, double click events, and button
	 * @param tab_index {Integer} the id of the tab
	 */
    run_query: function (queryid) {
        // Notify the user...
        // Set up a pointer to the result area of the active tab.
        var $workspace_result = $($.find('.workspace_results'));
        // Fetch the resultset from the server
        run.request({
            method: "GET",
            url: run.username + "/query/" + queryid + "/result/cheat",
            success: function (data, textStatus, XMLHttpRequest) {
                run.render_result(data,$workspace_result);
				run.hide_processing(true);
            },

            error: function () {
                // Let the user know that their query was not successful
                view.hide_processing(true);
                view.show_dialog("Result Set", "There was an error getting the result set for that query.", "info");
            }
        });
    },
    open_query: function (query_name) {
			run.request({
				url: run.username + "/repository/" + query_name,
				dataType: 'xml',
				success: function (data, textStatus, jqXHR) {
                    var q = run.generate_query_id();
					run.new_query(q,jqXHR.responseText,function() {
                            run.run_query(q);
                    });
				}
			});
		},
    render_result: function(data,$workspace_result) {
                    if (data == "") {

						// No results table
						var table_vis = '<div style="text-align:center;">No results</div>';

						// Insert the table to the DOM
						$workspace_result.html(table_vis);

					} else if ( (data[0][0])['type'] == "ERROR") {
                        var table_vis = '<div style="text-align:center;color:red;">' + (data[0][0])['value'] +'</div>';
                        $workspace_result.html(table_vis);
                    } else {
						// Create a variable to store the table
						var table_vis = '<table>';

						// Start looping through the result set
						$.each(data, function (i, cells) {

							// Add a new row.
							table_vis = table_vis + '<tr>';

							// Look through the contents of the row
							$.each(cells, function (j, header) {

								// If the cell is a column header and is null (top left of table)
								if (header['type'] === "COLUMN_HEADER" && header['value'] === "null") {
									table_vis = table_vis + '<th class="all_null"><div>&nbsp;</div></th>';
								} // If the cell is a column header and isn't null (column header of table)
								else if (header['type'] === "COLUMN_HEADER") {
									table_vis = table_vis + '<th class="col"><div>' + header['value'] + '</div></th>';
								} // If the cell is a row header and is null (grouped row header)
								else if (header['type'] === "ROW_HEADER" && header['value'] === "null") {
									table_vis = table_vis + '<th class="row_null"><div>&nbsp;</div></th>';
								} // If the cell is a row header and isn't null (last row header)
								else if (header['type'] === "ROW_HEADER") {
									table_vis = table_vis + '<th class="row"><div>' + header['value'] + '</div></th>';
								}
                                else if (header['type'] === "ROW_HEADER_HEADER") {
									table_vis = table_vis + '<th class="row_header"><div>' + header['value'] + '</div></th>';
								} // If the cell is a normal data cell
								else if (header['type'] === "DATA_CELL") {
									table_vis = table_vis + '<td class="data"><div>' + header['value'] + '</div></td>';
								}

							});

							// Close of the new row
							table_vis = table_vis + '</tr>';

						});

						// Close the table
						table_vis = table_vis + '</table>';

						// Insert the table to the DOM
						$workspace_result.html(table_vis);

						// Group column headers
						// TODO - Could be done in a plugin

						var prev_cell_text,
						j = 1,
						prev_cells = [];

						// Loop through all table headers with the class col
						$workspace_result.find('table tr th.col').each(function(i) {

							// If the previous cell text is the same as this cell text
							if (prev_cell_text === $(this).text()) {
								// Add the previous cell reference to an array
								prev_cells.push($prev_cell);
								// Increment the counter
								j++;
							} else {
								// If the counter is more than one i.e. more than the same header
								if (j > 1) {
									// Loop through the array of previous cell references
									$.each(prev_cells, function(index, value) {
										// Physicaly remove the previous cell references
										$(this).remove();
									});
									// With the last cell add the colspan attribute with the value
									// of the counter
									$prev_cell.attr('colspan', j);
								}
								// Reset the counter otherwise
								j = 1;
							}

							// Store the previous cell text and
							// previous cell reference into pointers
							prev_cell_text = $(this).text();
							$prev_cell = $(this);

						});

						// Equal widths on columns
						var max = 0;
						$workspace_result.find('table td').each(function() {
							max = Math.max($(this).width(), max);
						}).find('div').width(max);


					}
        },
     show_processing : function (msg) {
            $.unblockUI();
            $.blockUI({
                message: '<div class="processing"><div class="processing_inner"><span class="processing_image">&nbsp;</span>' + msg + '</div></div>',
                overlayCSS:  {
                    backgroundColor: '#FFF',
                    opacity:         0.5
                }
            });
    },
    
     hide_processing : function(block_div) {
        $.unblockUI();
        
    }

};
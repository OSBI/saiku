var model = {
    /**
	 * Run the query (triggered by drag events, double click events, and button
	 * @param tab_index {Integer} the id of the tab
	 */
    run_query: function (tab_index) {
        // Make sure that a cube has been selected on this tab
        if (!view.tabs.tabs[tab_index].data['query_name']) {
            view.show_dialog("Run query", "Please select a cube first.", "info");
            return false;
        }

        // Check if the drillthrough button is enabled
        if (view.tabs.tabs[tab_index].data['options']['drillthrough']) {
            // Lets disable it and set the property to false
            view.tabs.tabs[tab_index].data['options']['drillthrough'] = false
            // Enable the button on the toolbar
            var $button = view.tabs.tabs[tab_index].content.find('.drillthrough');
            $button.removeClass('on');
        }

        var col_counter = view.tabs.tabs[tab_index].content.find('.columns ul li').length;
        var row_counter = view.tabs.tabs[tab_index].content.find('.rows ul li').length;

        // Abort if one axis or the other is empty
        if (col_counter == 0 || row_counter == 0) return;

        // Notify the user...
        view.show_processing('Executing query. Please wait...', true, tab_index);

        // Set up a pointer to the result area of the active tab.
        var $workspace_result = view.tabs.tabs[tab_index].content.find('.workspace_results');

        // Fetch the resultset from the server
        model.request({
            method: "GET",
            url: model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/result/",
            success: function (data, textStatus, XMLHttpRequest) {

                if (data == "") {

                    // No results table
                    var table_vis = '<div style="text-align:center;">No results</div>';

                    // Insert the table to the DOM
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


                    // Enable highlighting on rows.
                    $workspace_result.find('table tr').hover(function () {
                        $(this).find('td, th.row, th.row_null').css('background', '#eff4fc');
                    }, function () {
                        $(this).find('td, th.row, th.row_null').css('background', '');
                    });
                }

                // Resize the workspace
                view.resize_height(tab_index);

                // Clear the wait message
                view.hide_processing(true, tab_index);
            },

            error: function () {
                // Let the user know that their query was not successful
                view.hide_processing(true, tab_index);
                view.show_dialog("Result Set", "There was an error getting the result set for that query.", "info");
            }
        });
    },

    /**
	 * Drillthrough the current query
	 * @param tab_index {Integer} the id of the tab
	 */
    drillthrough: function (tab_index) {
        // Make sure that a cube has been selected on this tab
        if (!view.tabs.tabs[tab_index].data['query_name']) {
            view.show_dialog("Run query", "Please select a cube first.", "info");
            return false;
        }

        // Enable the button on the toolbar
        var $button = view.tabs.tabs[tab_index].content.find('.drillthrough');
        if (view.tabs.tabs[tab_index].data['options']['drillthrough']) {
            view.tabs.tabs[tab_index].data['options']['drillthrough'] = false;
            $button.removeClass('on');
        } else {
            view.tabs.tabs[tab_index].data['options']['drillthrough'] = true;
            $button.addClass('on');
        }

        if (!view.tabs.tabs[tab_index].data['options']['drillthrough']) {
            var $workspace_result = view.tabs.tabs[tab_index].content.find('.workspace_results');
            $workspace_result.html("<table />");
            model.run_query(tab_index);
        } else {

            var col_counter = view.tabs.tabs[tab_index].content.find('.columns ul li').length;
            var row_counter = view.tabs.tabs[tab_index].content.find('.rows ul li').length;

            // Abort if one axis or the other is empty
            if (col_counter == 0 || row_counter == 0) return;

            // Notify the user...
            view.show_processing('Executing drillthrough. Please wait...', true, tab_index);

            // Set up a pointer to the result area of the active tab.
            var $workspace_result = view.tabs.tabs[tab_index].content.find('.workspace_results');

            // Fetch the resultset from the server
            model.request({
                method: "GET",
                url: model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/drillthrough:500",
                success: function (data, textStatus, XMLHttpRequest) {

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

                    // Enable highlighting on rows.
                    $workspace_result.find('table tr').hover(function () {
                        $(this).children().css('background', '#eff4fc');
                    }, function () {
                        $(this).children().css('background', '');
                    });


                    // Resize the workspace
                    view.resize_height(tab_index);

                    // Clear the wait message
                    view.hide_processing(true, tab_index);
                },

                error: function () {
                    // Let the user know that their query was not successful
                    view.hide_processing(true, tab_index);
                    view.show_dialog("Result Set", "There was an error getting the result set for that query.", "info");
                }
            });
        }
    },

    /**
	 * Display the MDX for the active tab query.
	 * @param tab_index {Integer} The active tab index.
	 */
    show_mdx: function (tab_index) {

        // Fetch the MDX from the server
        model.request({
            method: "GET",
            dataType: 'html',
            url: model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/mdx",
            success: function (data, textStatus, XMLHttpRequest) {
                // Let the user know that their query was not successful
                view.show_dialog("MDX", data, "mdx");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // Let the user know that their query was not successful
                view.show_dialog("MDX", "There was an error getting the MDX for that query.", "info");
            }
        });

    },

    load_properties: function (tab_index) {
        url = model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/properties/";
        model.request({
            method: "GET",
            url: url,
            success: function (data, textStatus, XMLHttpRequest) {
                for (var key in data) {
                    if (key == "saiku.olap.query.nonempty") {
                        if (data[key] == "true") {
                            view.tabs.tabs[tab_index].data['options']['nonempty'] = true;
                            var $button = view.tabs.tabs[tab_index].content.find('a[title="Non-empty"]');
                            $button.addClass("on");
                        } else {
                            view.tabs.tabs[tab_index].data['options']['nonempty'] = false;
                        }
                    }
                    if (key == "saiku.olap.query.drillthrough") {
                        if (data[key] == "false") {
                            var $button = view.tabs.tabs[tab_index].content.find('a[title="Drill Through"]');
                            $button.addClass("disabled_toolbar");
                        }
                    }
                }

            }
        });

    },

    /**
	 * Enable or disable NON EMPTY
	 * @param tab_index {Integer} The active tab index
	 */
    non_empty: function (tab_index) {

        view.show_processing('Setting Non-empty. Please wait...', true, tab_index);

        var $button = view.tabs.tabs[tab_index].content.find('a[title="Non-empty"]');
        if (view.tabs.tabs[tab_index].data['options']['nonempty']) {
            view.tabs.tabs[tab_index].data['options']['nonempty'] = false;
            $button.removeClass('on');
        } else {
            view.tabs.tabs[tab_index].data['options']['nonempty'] = true;
            $button.addClass('on');
        }

        url = model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/properties/saiku.olap.query.nonempty";

        // Notify server of change
        model.request({
            method: "POST",
            url: url,
            data: {
                'propertyValue': view.tabs.tabs[tab_index].data['options']['nonempty']
            },
            success: function () {
                // If automatic query execution is enabled, rerun the query when this option is changed
                if (view.tabs.tabs[tab_index].data['options']['automatic_execution']) {
                    model.run_query(tab_index);
                }
            }
        });

        view.hide_processing(true, tab_index);
    },

    /**
	 * Enable or disable automatic query execution
	 * @param tab_index {Integer} The active tab index
	 */
    automatic_execution: function (tab_index) {

        view.show_processing('Setting automatic execution. Please wait...', true, tab_index);

        var $button = view.tabs.tabs[tab_index].content.find('a[title="Automatic execution"]');
        if (view.tabs.tabs[tab_index].data['options']['automatic_execution']) {
            view.tabs.tabs[tab_index].data['options']['automatic_execution'] = false;
            $button.removeClass('on');
        } else {
            view.tabs.tabs[tab_index].data['options']['automatic_execution'] = true;
            $button.addClass('on');
        }

        view.hide_processing(true, tab_index);
    },

    /**
	 * Show or hide the fields list
	 * @param tab_index {Integer} The active tab index
	 */
    toggle_fields: function (tab_index) {
        var $button = view.tabs.tabs[tab_index].content.find('a[title="Toggle fields"]');
        if (view.tabs.tabs[tab_index].data['options']['toggle_fields']) {
            view.tabs.tabs[tab_index].data['options']['toggle_fields'] = false;
            $button.removeClass('on');
            view.tabs.tabs[tab_index].content.find('.workspace_fields').show();
            view.toggle_sidebar($button);
            view.resize_height(tab_index);
        } else {
            view.tabs.tabs[tab_index].data['options']['toggle_fields'] = true;
            $button.addClass('on');
            view.tabs.tabs[tab_index].content.find('.workspace_fields').hide();
            view.toggle_sidebar($button);
            view.resize_height(tab_index);
        }
    },

    /**
	 * Swap axis
	 * @param tab_index {Integer} The active tab index
	 */
    swap_axis: function (tab_index) {

        view.show_processing('Swapping axis. Please wait...', true, tab_index);

        // Swap the actual selections
        var $rows = view.tabs.tabs[tab_index].content.find('.rows li');
        var $columns = view.tabs.tabs[tab_index].content.find('.columns li');

        $rows.detach().appendTo(view.tabs.tabs[tab_index].content.find('.columns ul'));
        $columns.detach().appendTo(view.tabs.tabs[tab_index].content.find('.rows ul'));

        var url = model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/swapaxes";

        // Notify server of change
        model.request({
            method: "PUT",
            url: url,
            success: function () {
                // If automatic query execution is enabled, rerun the query when this option is changed
                if (view.tabs.tabs[tab_index].data['options']['automatic_execution']) {
                    model.run_query(tab_index);
                }
            }
        });


        view.hide_processing(true, tab_index);
    },

    /**
	 * Export data as Excel XML
	 * @param tab_index {Integer} The active tab index
	 */
    export_xls: function (tab_index) {

        window.location = TOMCAT_WEBAPP + REST_MOUNT_POINT + model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/export/xls";

    },

    /**
	 * Export data as CSV
	 * @param tab_index {Integer} The active tab index
	 */
    export_csv: function (tab_index) {

        window.location = TOMCAT_WEBAPP + REST_MOUNT_POINT + model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/export/csv";

    },

    /**
	 * Save the query
	 * @param tab_index {Integer} The active tab index
	 */
    save_query: function (tab_index) {
        // Append a dialog <div/> to the body.
        $('<div id="dialog" class="dialog hide" />').appendTo('body');
        // Load the view into the dialog <div/> and disable caching.
        $.ajax({
            url: BASE_URL + 'views/queries/save.html',
            cache: false,
            dataType: "html",
            success: function (data) {
                $('#dialog').html(data).modal({
                    opacity: 100,
                    onShow: function (dialog) {
                        dialog.data.find('#query_name').val($('#header').find('.selected').find('a').html());
                        dialog.data.find('#save_query').click(function () {
                            if (dialog.data.find('#query_name').val().length == 0) {
                                dialog.data.find('.error_msg').html('You need to specify a name for your query.');
                            } else {
                                var query_name = dialog.data.find('#query_name').val();

                                var url = model.username + "/repository/" + view.tabs.tabs[tab_index].data['query_name'];

                                model.request({
                                    method: "POST",
                                    url: url,
                                    data: {
                                        'newname': encodeURI(query_name)
                                    },
                                    success: function () {
                                        // Change the tab title
                                        $('#header').find('.selected').find('a').html(query_name);
                                        // Change the dialog message
                                        $('#dialog').find('.dialog_body_save').text('').text('Query saved succesfully.');
                                        // Remove the dialog save button
                                        $('#save_query').remove();
                                        // Rename the cancel button
                                        $('#save_close').text('OK');
                                    }
                                });
                            }
                        });
                    },
                    onClose: function (dialog) {
                        // Remove all simple modal objects.
                        dialog.data.remove();
                        dialog.container.remove();
                        dialog.overlay.remove();
                        $.modal.close();
                        // Remove the #dialog which we appended to the body.
                        $('#dialog').remove();
                    }
                });
            }
        });
    },

    /**
	 * Open a query
	 * @param query_name The name of the query
	 * @param tab_index The tab to load it into
	 */
    open_query: function (query_name, tab_index) {
        // Change tab title
        view.tabs.tabs[tab_index].tab.find('a').text(query_name);

        //TODO - request selections and adjust UI accordingly
        model.request({
            url: model.username + "/repository/" + query_name,
            dataType: 'xml',
            success: function (data, textStatus, jqXHR) {
                // Create a new query in the workspace
                model.new_query(tab_index, jqXHR.responseText, model.load_cube );
            }
        });
    },
    
    load_cube: function (tab_index, cube, data) {
        // Select cube in menu
        var selected_cube = cube.name;
        $cubes = view.tabs.tabs[tab_index].content.find('.cubes');
        $cubes.val($cubes.find('option:[text="' + selected_cube + '"]').val());

        // save connection data
        var $cube = view.tabs.tabs[tab_index].content.find(".cubes option:selected");
        var cube_data = view.tabs.tabs[tab_index].data['navigation'][$cube.attr('value')];
        var connection_data = {
            'connection': cube_data['connectionName'],
            'cube': cube_data['cube'],
            'catalog': cube_data['catalogName'],
            'schema': cube_data['schema']
        };

        view.tabs.tabs[tab_index].data['connection'] = connection_data;

        // TODO - Move selections to axes
        $.each(data.saikuAxes, function (axis_iterator, axis) {
            var $axis = view.tabs.tabs[tab_index].content.find('.workspace_fields').find('.' + axis.name.toLowerCase() + ' ul');

            $.each(axis.dimensionSelections, function (dim_iter, dimension) {
                var levels = new Array();
                var test = new Object();
                $.each(dimension.selections, function (sel_iter, selection) {

                    if (selection.dimensionUniqueName != "Measures") {

                        if (levels.indexOf(selection.levelUniqueName) < 0) {
                            var dimitem = view.tabs.tabs[tab_index].content.find('.dimension_tree').find('a[title="' + selection.levelUniqueName + '"]').parent();
                            var drop_item = dimitem.clone().addClass('d_dimension');
                            //                                        drop_item.find('a').click(function (e) {
                            //                                            if ($(this).hasClass('dimension')) {
                            //                                                var $tab = $(this).closest(".tab");
                            //                                                model.show_selections($(this), $tab);
                            //                                            }
                            //
                            //                                            return false;
                            //                                        });

                            $(drop_item).appendTo($axis);

                            levels.push(selection.levelUniqueName);

                            var $dimension_tree = view.tabs.tabs[tab_index].content.find('.dimension_tree'); /** Find the parent dimension id. */
                            var id = dimitem.find('a').attr('rel');
                            var parent_id = id.split('_')[0] /** Disable all of the dimension's siblings and highlight the dimension being used. */
                            $dimension_tree.find('[rel=' + id + ']').parent().addClass('used').removeClass('ui-draggable').addClass('not-draggable'); /** Highlight the dimension's parent being used. */
                            $dimension_tree.find('[rel=' + parent_id + ']').parent().addClass('used');

                        }
                        if (selection.type == "MEMBER") {
                            if (!test[selection.levelUniqueName]) {
                                var m = $axis.find('a[title="' + selection.levelUniqueName + '"]')
                                test[selection.levelUniqueName] = 1;
                                $(m).text(m.text() + ' (' + 1 + ')');
                            } else {
                                test[selection.levelUniqueName] += 1;
                                var m = $axis.find('a[title="' + selection.levelUniqueName + '"]')
                                var prevText = $(m).text().split('(')[0];
                                $(m).text(prevText + ' (' + test[selection.levelUniqueName] + ')');
                            }
                        }

                    } else {
                        var measureitem = view.tabs.tabs[tab_index].content.find('.measure_tree').find('a[title="' + selection.uniqueName + '"]').parent();

                        $(measureitem.clone().addClass('d_measure')).appendTo($axis);
                        var $measure_tree = view.tabs.tabs[tab_index].content.find('.measure_tree');

                        /** Disable and highlight the measure. */
                        var id = measureitem.find('a').attr('rel');
                        $measure_tree.find('[rel=' + id + ']').parent().removeClass('ui-draggable').addClass('used not-draggable');
                        $measure_tree.find('.root').addClass('used');

                    }



                });
            });
        });

        var $tab = view.tabs.tabs[tab_index].content;
        var $column_dropzone = $tab.find('.columns ul');
        var $row_dropzone = $tab.find('.rows ul');
        var $filter_dropzone = $tab.find('.filter ul');

        // If automatic query execution is enabled, rerun the query after making change
        if (view.tabs.tabs[tab_index].data['options']['automatic_execution']) {
            if ($row_dropzone.find('li.d_measure, li.d_dimension').length > 0 && $column_dropzone.find('li.d_measure, li.d_dimension').length > 0) {
                model.run_query(tab_index);
            }
        }

        view.check_toolbar(tab_index);

    // TODO - Retrieve properties for this query
    },

    /**
	 * Delete a query from the repository
	 */
    delete_query_from_repository: function (query_name, tab_index) {
        // Append a dialog <div/> to the body.
        $('<div id="dialog" class="dialog hide" />').appendTo('body');
        // Load the view into the dialog <div/> and disable caching.
        $.ajax({
            url: BASE_URL + 'views/queries/delete.html',
            cache: false,
            dataType: "html",
            success: function (data) {
                $('#dialog').html(data).modal({
                    opacity: 100,
                    onShow: function (dialog) {
                        dialog.data.find('#delete_query').click(function () {
                            model.request({
                                method: "DELETE",
                                url: model.username + "/repository/" + query_name + "/",
                                success: function (data, textStatus, XMLHttpRequest) {
                                    view.tabs.tabs[tab_index].content.find(".workspace_results").empty();
                                    model.get_queries(tab_index);

                                    $('.open_query_tb').find('a').remove();
                                    $('.delete_query_tb').find('a').remove();

                                    // Change the dialog message
                                    $('#dialog').find('.dialog_body_delete').text('').text('Query deleted succesfully.');
                                    // Remove the dialog save button
                                    $('#delete_query').remove();
                                    // Rename the cancel button
                                    $('#delete_close').text('OK');

                                }
                            });
                        });
                    },
                    onClose: function (dialog) {
                        // Remove all simple modal objects.
                        dialog.data.remove();
                        dialog.container.remove();
                        dialog.overlay.remove();
                        $.modal.close();
                        // Remove the #dialog which we appended to the body.
                        $('#dialog').remove();

                    }
                });
            }
        });
    },

    /**
	 * Get a list of queries
	 * @param tab_index {Integer} The active tab index
	 */
    get_queries: function (tab_index) {
        model.request({
            method: "GET",
            url: model.username + "/repository/",
            success: function (data, textStatus, XMLHttpRequest) {
                view.load_queries(tab_index, data);
            }
        });
    },

    /*load_children : function(member, tab_data, callback) {
        // TODO better solution, fix for PALO
        if (tab_data.schema == "undefined" || tab_data.schema == "" ) {
            tab_data.schema = "null";
        }
        var url = model.username + '/discover/' + tab_data.connection + "/" + tab_data.catalog + "/" + tab_data.schema + "/" + tab_data.cube + "/member/" + member + "/children";
        model.request({
            method: "GET",
            url: url,
            success: function(data, textStatus, jqXHR) {
                callback(data);
            }
        });
    },
    load_selection_listbox : function(tab_index, axis, dimension) {
        var query_name = view.tabs.tabs[tab_index].data['query_name'];
        var url = model.username + '/query/' + query_name + "/axis/" + axis + "/dimension/" + dimension;
        model.request({
            method: "GET",
            url: url,
            success: function(data, textStatus, jqXHR) {
                view.load_selection_listbox($('.selection_listbox'),axis, data,tab_index);

            }
        });
    },*/
    /**
	 * Show and populate the selection dialog
	 * @param tab_index {Integer} The active tab index
	 */
    show_selections: function (member_clicked, $tab) {

        var tab_index = view.tabs.index_from_content($tab);
        var member_data = view.tabs.tabs[tab_index].data['dimensions'][member_clicked.parent().attr('title')];
        var tab_data = view.tabs.tabs[tab_index].data['connection'];
        var query_name = view.tabs.tabs[tab_index].data['query_name'];
        var axis = "";

        if (member_clicked.parent().parent().parent().hasClass('rows')) {
            axis = "ROWS";
        }
        if (member_clicked.parent().parent().parent().hasClass('columns')) {
            axis = "COLUMNS";
        }
        if (member_clicked.parent().parent().parent().hasClass('filter')) {
            axis = "FILTER";
        }

        view.show_processing('Loading selections. Please wait...', true, tab_index);

        // Append a dialog <div/> to the body.
        $('<div id="dialog_selections" class="selections dialog hide" />').appendTo($tab);


        // Handle showing the unique and caption names
        var visible = true;
        $('#show_unique').live('change',function() {
            if(visible) {
                $('#dialog_selections select option').each(function(i, options) {
                    $(this).text($(this).val());
                });
                visible = false;
            }else{
                $('#dialog_selections select option').each(function(i, options) {
                    $(this).text($(this).attr('lang'));
                });
                visible = true;
            }
        });

        // Load the view into the dialog <div/> and disable caching.
        $.ajax({
            url: BASE_URL + 'views/selections/index.html',
            cache: false,
            dataType: "html",
            success: function (data) {
                $('#dialog_selections').html(data).modal({
                    onShow: function (dialog) {

                        // Change the title of the dialog box
                        $('#dialog_selections').find('h3').text('Selections on ' + member_data.levelname);

                        // TODO better solution, fix for PALO
                        if (tab_data.schema == "undefined" || tab_data.schema == "") {
                            tab_data.schema = "null";
                        }

                        

                        // URL to retrieve all available members
                        var url = model.username + "/discover/" + tab_data.connection + "/" + tab_data.catalog + "/" + tab_data.schema + "/" + tab_data.cube + "/dimensions/" + member_data.dimension + "/hierarchies/" + member_data.hierarchy + "/levels/" + member_data.level + "/";

                        // Retrieve all available members with an AJAX request
                        model.request({
                            method: "GET",
                            url: url,
                            success: function (data, textStatus, jqXHR) {

                                // Setup pointers
                                $available_selections = $('#dialog_selections .available_selections select');
                                $used_selections = $('#dialog_selections .used_selections select');

                                /*
                                 * Step 1
                                 * Get a list of all USED members
                                 */

                                // URL to retrieve all available members
                                var url = model.username + "/query/" + query_name + "/axis/" + axis + "/";
                                var used_array = [];
                                // Array to store all used selections
                                var used_selection = [];

                                // Retrieve all USED members with an AJAX request.
                                // This call will require to loop through dimension, level and members.
                                model.request({
                                    method: "GET",
                                    url: url,
                                    success: function (used_data, textStatus, jqXHR) {

                                        // Loop through all available dimensions
                                        $.each(used_data, function (i, dimensions) {

                                            // Is the dimension unique name the same as what the user has selected
                                            if (dimensions['uniqueName'] === member_data.dimensionuniquename) {

                                                // Loop through all available selections
                                                $.each(dimensions['selections'], function (i, selections) {

                                                    // Loop through all levels which are MEMBERS
                                                    if (selections['levelUniqueName'] === member_data.level && selections['type'] == 'MEMBER') {

                                                        // Add the levels to the used_selections list box
                                                        $('#dialog_selections .used_selections select').append('<option value="' + selections['uniqueName'] + '" lang="'+selections['name']+'" title="' + selections['uniqueName'] + '">' + selections['name'] + '</option>');

                                                        // Store the uniqueName into the used_selection array for comparison later
                                                        used_selection.push(selections['uniqueName']);
                                                    }
                                                });
                                            }
                                        });

                                        /*
                                         * Step 2.
                                         * Load all AVAILABLE members
                                         */

                                        // Loop through each member and if does not exsist in the used_selection array
                                        // then append it to the listbox.
                                        $.each(data, function (member_iterator, member) {
                                            if ($.inArray(member['uniqueName'], used_selection) == -1) {
                                                $available_selections.append('<option value="' + member['uniqueName'] + '" title="' + member['uniqueName'] + '" lang="' + member['caption'] + '">' + member['caption'] + '</option>');
                                            }
                                        });

                                        add_selections = function () {
                                            $available_selections.find('option:selected').appendTo($used_selections);
                                            $available_selections.find('option:selected').remove();
                                            $used_selections.find('option:selected').attr('selected', '');
                                        };

                                        // Clicking on the > button will add all selected members.
                                        $('#add_members').live('click', add_selections);
                                        $available_selections.find('option').live('dblclick', add_selections);

                                        remove_selections = function () {
                                            $used_selections.find('option:selected').appendTo($available_selections);
                                            $used_selections.find('option:selected').remove();
                                            $available_selections.find('option:selected').attr('selected', '');
                                        };

                                        // Clicking on the < button will remove all selected members.
                                        $('#remove_members').live('click', remove_selections);
                                        $used_selections.find('option').live('dblclick', remove_selections);

                                    },
                                    error: function (data) {}
                                });

                                /*
                                 * Step 3.
                                 * Make the listbox interactive
                                 */

                                // End processing
                                view.hide_processing(true, tab_index);
                                /*
                                 * Step 4.
                                 * Bind the following when the save button is clicked.
                                 */

                                // When the save button is clicked
                                $('.save_selections').click(function () {

                                    // Show processing
                                    view.show_processing('Saving selections. Please wait...', true, tab_index);

                                    // After the save button is clicked lets hide the dialog to display the above message
                                    $('#dialog_selections').hide();

                                    /*
                                     * Step 5.
                                     * Is the used selections box empty?
                                     * If so remove all available members and add LEVEL
                                     */

                                    var member_updates = "[";
                                    var member_iterator = 0;
                                    // First remove all AVAILABLE members
                                    // We don't have to do this by each member, removing the level removes all members as well
                                    /* $('#dialog_selections .available_selections select option')
                                    .each(function(used_members, index) {
                                        if (member_iterator > 0) {
                                            member_updates += ",";
                                        }
                                        member_iterator++;
                                        member_updates += '{"uniquename":"' + $(this).val() + '","type":"member","action":"delete"}';
                                    });
                                    */
                                    if (member_iterator > 0) {
                                        member_updates += ",";
                                    }
                                    member_updates += '{"hierarchy":"' + member_data.hierarchy + '","uniquename":"' + member_data.level + '","type":"level","action":"delete"}';


                                    // Counter to track all members which are being used

                                    if ($used_selections.find('option').length == 0) {
                                        // if no selections were made include the level, even if it already included
                                        if (member_updates.length > 1) {
                                            member_updates += ",";
                                        }
                                        member_updates += '{"hierarchy":"' + member_data.hierarchy + '","uniquename":"' + member_data.level + '","type":"level","action":"add"}';

                                    } else {

                                        /*
                                         * Step 6.
                                         * Is used selections box NOT empty?
                                         * If so first remove all AVAILABLE members and add all USED members and remove LEVEL
                                         */

                                        // Secondly add all USED members
                                        // Loop through all used selections box
                                        $('#dialog_selections .used_selections select option').each(function (members, index) {
                                            if (member_updates.length > 1) {
                                                member_updates += ",";
                                            }
                                            member_updates += '{"uniquename":"' + $(this).val() + '","type":"member","action":"add"}';
                                            member_iterator = member_iterator + 1;

                                        });
                                    }

                                    member_updates += "]";

                                    var url = model.username + "/query/" + query_name + "/axis/" + axis + "/dimension/" + member_data.dimension;

                                    // AJAX request to POST from the Saiku Server
                                    model.request({
                                        method: "PUT",
                                        url: url,
                                        data: member_updates,
                                        dataType: "json",
                                        contentType: 'application/json',
                                        success: function (data, textStatus, jqXHR) {

                                            var selection_num = $('#dialog_selections .used_selections select option').length;
                                            $tree_item = view.tabs.tabs[tab_index].content.find('.dimension_tree').find('a[rel="' + $(member_clicked).attr('rel') + '"]');
                                            // Append the counter the dropped item
                                            if (selection_num == 0) {
                                                $(member_clicked).text($tree_item.text());
                                            } else {
                                                $(member_clicked).text($tree_item.text() + ' (' + selection_num + ')');
                                            }

                                            
                                            // Remove all simple modal objects.
                                            dialog.data.remove();
                                            dialog.container.remove();
                                            dialog.overlay.remove();
                                            $.modal.close();

                                            // Remove the #dialog which we appended to the body.
                                            $('#dialog_selections').remove();

                                            // Hide the processing
                                            view.hide_processing(true, tab_index);

                                            // Execute the query
                                            model.run_query(tab_index);
                                        },
                                        error: function (data) {
                                        // TODO - Notify the user
                                        }
                                    });
                                });
                            }
                        });


                    }
                });
            },
            error: function (data) {

            }
        });
    }
};
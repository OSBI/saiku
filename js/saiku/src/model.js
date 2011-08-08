var model = {
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
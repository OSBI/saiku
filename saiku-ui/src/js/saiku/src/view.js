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
 * @fileOverview    This represents the view for Saiku UI.
 * @description     This will handle the drawing of the UI.
 * @version         1.0.0
 */

/**
 * View class.
 * @class
 */
var view = {
    /** Display the login form when the view is initialised. */
    init : function() {

        if (PLUGIN == "true") {
            view.show_processing('Loading Saiku User Interface. Please wait...');
            // Create the session and log in.
            model.get_session();
        }
        else {
            // Append a dialog <div/> to the body.
            $('<div id="dialog" class="dialog hide" />').appendTo('body');

            // Load the view into the dialog <div/> and disable caching.
            $.ajax({
                url : BASE_URL + 'views/session/index.html',
                cache : false,
                dataType : "html",
                success : function(data) {
                    $('#dialog').html(data).modal({
                        opacity : 100,
                        // onShow : function (dialog) {}
                        onClose : function (dialog) {
                            // Get the username and password from the form.
                            model.username = $('#username').val();
                            model.password = $('#password').val();

                            // Remove all simple modal objects.
                            dialog.data.remove();
                            dialog.container.remove();
                            dialog.overlay.remove();
                            $.modal.close();

                            // Remove the #dialog which we appended to the body.
                            $('#dialog').remove();

                            // Show pre loading message
                            // $('<div class="dialog pre_waiting"><div class="dialog_inner"><div class="dialog_body_waiting">Loading Saiku. Please wait...</div></div></div>').appendTo('body');

                            view.show_processing('Loading Saiku User Interface. Please wait...');

                            // Create the session and log in.
                            model.get_session();
                        }
                    });
                }
            });
        }


    },

    /** Tabs container. */
    tabs : new TabContainer($("#tabs"), $('#tab_panel')),

    /**
     * Resize layout to fit window height
     */
    resize_height: function(tab_index) {

        // What tab is being viewed
        var $active_tab = view.tabs.tabs[tab_index].content;
        var window_height, workspace_header;

        // Work out the browser windows height and make sure that it is set to
        // 600px when the user reduces the height below 600px.
        if ($(window).height() <= 600) {
            var window_height = 600;
        }else{
            var window_height = $(window).height();
        }

        // Work out the header height and add 1px for the border-bottom on the
        // header.
        var header_height = $('#header').outerHeight() + 1;

        // Work out the sidebar height, which is the header minus the window
        // height.
        var sidebar_height = window_height - header_height;

        // Work out the height of the workspace toolbar.
        var workspace_toolbar = $active_tab.find('.workspace_toolbar').outerHeight(true);

        // Work out the height of the fields area
        var workspace_fields = $active_tab.find('.workspace_fields').outerHeight(true);

        // Calculate workspace_header area taking into account that fields can
        // be hidden or shown

        if($active_tab.find('.workspace_fields').is(':visible')) {
            var workspace_header = workspace_toolbar + workspace_fields;
        }else{
            var workspace_header = workspace_toolbar;
        }

        // Set sidebar heights
        $active_tab.find('.sidebar, .sidebar_separator, .workspace_inner')
        .css('height', sidebar_height);

        $active_tab.find('.workspace_results')
        // Add 30 for padding on height
        .css('height', (sidebar_height - workspace_header) - 30);

    },

    /**
     * Toggle (hide/show) the sidebar.
     */
    toggle_sidebar: function($sidebar_separator) {
        // Find the tab
        var $tab = $sidebar_separator.closest('.tab');

        // Get the width of the sidebar.
        var sidebar_width = $tab.find('.sidebar').width();

        if (sidebar_width == 260) {
            // If the sidebar is not hidden.
            $tab.find('.sidebar').css('width', 0);
            $tab.find('.workspace_inner').css('margin-left', 5);
        } else {
            // If the sidebar is hidden.
            $tab.find('.sidebar').css('width', 260);
            $tab.find('.workspace_inner').css('margin-left', 265);
        }
    },

    /** Initialise the user interface. */
    draw_ui : function () {

        // Patch for webkit browsers to stop the text cursor appearing
        // when dragging items.
        document.onselectstart = function () {
            return false;
        };

        /** Show all UI elements. */
        $('#header, #tab_panel').show();

        if (PLUGIN != "true") {
            $('#toolbar, #tabs').show();
            /** Add an event handler to all toolbar buttons. */
            $("#toolbar ul li a").click(function() {
                controller.toolbar_click_handler($(this));
                return false;
            });
        }


        /** Bind resize_height() to the resize event. */
        $(window).bind('resize', function() {
            view.resize_height(view.tabs.index_from_tab($('#tabs').find('.selected')));
        });

        /** Bind toggle_sidebar() to click event on the sidebar_separator. */
        $('.sidebar_separator').live('click', function() {
            view.toggle_sidebar($(this));
        });

        /** Add click handler on tabs. */
        view.tabs.tab_container.find("a").live('mousedown', function(event) {
            view.tabs.select_tab(view.tabs.index_from_tab($(this).parent()));
            event.stopImmediatePropagation();
            event.cancelBubble = true;
            return false;
        });

        /** Add click handler on tabs. */
        view.tabs.tab_container.find("span").live('click', function() {
            if($(this).parent().attr('id') == 'queries') {
                var is_queries = true;
                view.tabs.remove_tab(view.tabs.index_from_tab($(this).parent()), is_queries);
                return false;
            }else{
                var is_queries = false;
                view.tabs.remove_tab(view.tabs.index_from_tab($(this).parent()), is_queries);
                return false;
            }

        });

        // Activate language selector
        $("#language-selector").val(locale)
        .change(function() {
            locale = $("#language-selector").val();
            $.ajax({
                url: BASE_URL + '/i18n/' + locale + ".json",
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        po_file = data;
                        $('.i18n_translated').un_i18n();
                        $('.i18n').i18n(po_file);
                    }
                }
            });
        });
    },

    /** Destroy the user interface. */
    destroy_ui : function () {
        $('#header, #tab_panel').hide();
    },

    /**
     * Populate a select box with available schemas and cubes.
     * @param tab_index {Integer} Index of the selected tab.
     */
    load_cubes : function(tab_index) {
        var $tab = view.tabs.tabs[tab_index].content;
        var $cubes = $tab.find('.cubes');
        $cubes.append('<option>Select a cube</option>');

        view.tabs.tabs[tab_index].data['navigation'] = new Array();
        var storage_id = 0;

        /** Loop through available connections and populate the select box. */
        $.each(model.connections, function(i,connection){
            $.each(connection.catalogs, function(cat_i,catalog){
                $.each(catalog.schemas, function(i,schema){

                    $cubes.append('<optgroup label="'+connection['name'] + ' - ' +catalog['name']+'">');
                    $.each(schema.cubes, function(i,cube){
                        $("<option />")
                        .attr({
                            'value': storage_id
                        })
                        .text(cube['name'])
                        .appendTo($cubes);
                        view.tabs.tabs[tab_index].data['navigation'][storage_id] = {
                            'connectionName': connection['name'],
                            'catalogName': catalog['name'],
                            'schema': schema['name'],
                            'cube': cube['name']
                        };
                        storage_id++;
                    });
                    $cubes.append('</optgroup>');
                });
            });
        });

        $cubes.change(function() {
            model.new_query(tab_index);
        });
    },

    /**
     * Load queries into the sidebar of the open query dialog
     * @param tab_index {Integer} Index of a queries.
     */
    load_queries: function(tab_index, data) {
        // Pointer for sidebar
        var $query_list = view.tabs.tabs[tab_index].content.find('.sidebar_inner ul');
        $query_list.empty();

        //view.tabs.tabs[tab_index].content.find(".workspace_results")
        //.text('Click on the names on the left to Open or Delete queries.');

        // Load the list of queries
        $.each(data, function(query_iterator, query) {
            var $list_element = $('<li />').appendTo($query_list);
            $("<a />").text(query.name)
            .data('object', query)
            .attr('href', '#')
            .attr('title', 'Click on the query name to open or delete it')
            // Show information about the query when its name is clicked
            .click(function() {

                $('.open_query_tb').find('a').remove();
                $('.delete_query_tb').find('a').remove();

                var $query = $(this).data('object');
                var $results = view.tabs.tabs[tab_index].content.find(".workspace_results");
                $results.html('<h3><strong>' + $query.name + '</strong></h3>');
                var $properties = $('<ul id="query_info" />').appendTo($results);
                // Iterate through properties and show a key=>value set in the information pane
                for (property in $query) {
                    if ($query.hasOwnProperty(property)) {
                        $properties.append($('<li />').html("<strong>"+property + "</strong> : " + $query[property]));
                    }
                }
                // Add open query button to the toolbar
                $('<a />')
                .attr('href', '#')
                .addClass('i18n open button')
                .attr('title', 'Open query')
                .i18n(po_file)
                .click(function() {
                    model.open_query($query.name, view.tabs.add_tab());
                    return false;
                })
                .appendTo($('.open_query_tb'));

                // Add delete query button to the toolbar
                $('<a />')
                .attr('href', '#')
                .attr('title', 'Delete query')
                .addClass('i18n delete button')
                .i18n(po_file)
                .click(function() {
                    model.delete_query_from_repository($query.name, tab_index);
                    return false;
                })
                .appendTo($('.delete_query_tb'));

                return false;
            })
            .dblclick(function() {
                var $query = $(this).data('object');
                model.open_query($query.name, view.tabs.add_tab());
                return false;
            })
            .appendTo($list_element);
        });
    },

    /*load_selection_listbox : function($selection_listbox,axis, data, tab_index) {
        $selection_listbox.find('select').remove();
        $selection_listbox = $('<select size="10"/>').appendTo($selection_listbox);
        $.each(data.selections, function(selection_iterator, selection) {
            $item = $('<option value="' + selection.uniqueName + '" title="' + selection.uniqueName + '" class="' + selection.type +'">' + selection.uniqueName + '</otpion>')
            .dblclick(function(e) {
                e.preventDefault();
                var url = "";
                if (selection.type == "LEVEL") {
                    url = model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/axis/" + axis + "/dimension/" + selection.dimensionUniqueName
                    + "/hierarchy/" + selection.hierarchyUniqueName + "/" + selection.uniqueName;
                }
                if (selection.type == "MEMBER") {
                    url = model.username + "/query/" + view.tabs.tabs[tab_index].data['query_name'] + "/axis/" + axis + "/dimension/" + selection.dimensionUniqueName
                    + "/member/"  + selection.uniqueName;
                }
                model.request({
                    method: "DELETE",
                    url: url,
                    success: function(data, textStatus, XMLHttpRequest) {
                        $item.remove();
                    }
                });
                return false;
            });
            $item.appendTo($selection_listbox);

        });
    },*/

    load_children : function($item, axis, $dimension_name, tab_index) {
        member = $item.find('a').attr('title');
        var tab_data = view.tabs.tabs[tab_index].data['connection'];
        var member_id = 0;
        model.load_children(member,tab_data,function(data){
            var $second_level = $('<ul />').appendTo($item);
            $.each(data, function(member_iterator, member) {
                member_id++;

                var $li = $('<li/>');
                $('<span class="collapsed unloaded"><a href="#" class="measure" rel="m_' + member_iterator + '" title="' + member['uniqueName'] + '">' + member['caption'] + '</a></span>')
                .mousedown(function() {
                    return true;
                }).click(function(e) {
                    e.preventDefault();
                    $(this).parent().find('ul').toggle();
                    if ($(this).hasClass('expand')) {
                        $(this).removeClass('expand').addClass('collapsed');
                    }else{
                        $(this).removeClass('collapsed').addClass('expand');
                    }
                    if ($(this).hasClass('unloaded')) {
                        view.load_children($(this),axis,$dimension_name, tab_index);
                        $(this).removeClass('unloaded').addClass('loaded');
                    }
                    return false;
                })
                .attr('title', member['uniqueName'])
                .appendTo($li);
                $($li).appendTo($second_level);
            // Create a parent-child relationship with the rel attribute.



            });
        });

    },
    /**
     * Populate the dimension tree for the selected tab.
     * @param $tab {Object} Selected tab content.
     * @param data {Object} Data object which contains the available dimension
     *                      members.
     */
    load_dimensions : function(tab_index, data) {
        // Remove any instances of a tree.
        var $tab = view.tabs.tabs[tab_index].content;
        $tab.find('.dimension_tree ul').remove();

        // Add a new dimension tree.
        var $dimension_tree = $('<ul />').appendTo($tab.find('.dimension_tree'));
        $dimension_tree.hide();

        // Populate the tree with first level dimensions.
        var dimension_id = 0;
        delete view.tabs.tabs[tab_index].data['dimensions'];
        view.tabs.tabs[tab_index].data['dimensions'] = new Array();
        $.each(data, function(dimension_iterator, dimension) {
            if (this['name'] != 'Measures') {
                // Make sure the first level has a unique rel attribute.
                var $first_level = $('<li><span class="root collapsed"><a href="#" rel="d' + dimension_iterator + '" class="folder_collapsed">' + this['name'] + '</a></span></li>')
                .appendTo($dimension_tree);
                var $second_level = $('<ul />').appendTo($first_level);
                $.each(dimension.hierarchies, function(hierarchy_iterator, hierarchy) {

                    // Add the hierarchy name.
                    $('<li class="hierarchy" />').html('<a href="#">' + hierarchy.caption + '</a>').appendTo($second_level);
                    // Loop through each hierarchy.
                    $.each(hierarchy.levels, function(level_iterator, level){
                        dimension_id++;
                        var $li = $('<li />').mousedown(function() {
                            return false;
                        })
                        .attr('title', dimension_id)
                        .appendTo($second_level);
                        view.tabs.tabs[tab_index].data['dimensions'][dimension_id] = {
                            'dimension': dimension.name,
                            'hierarchy': hierarchy.uniqueName, //hierarchy.hierarchy
                            'level': level.uniqueName, // level.level
                            'dimensionuniquename' : dimension.uniqueName, // dimension.uniqueName
                            'levelname' : level.name // level.name
                        };
                        // Check if the dimension level is (All) if so display the All dimension_name instead.
                        if (level['caption'] === '(All)') {
                            // Create a parent-child relationship with the rel attribute.
                            var $second_level_link = $('<a href="#" class="dimension" rel="d' + dimension_iterator + '_' + hierarchy_iterator + '_' + level_iterator + '" title="' + level['uniqueName'] + '"> All ' + hierarchy.caption + '</a>')
                            .appendTo($li);
                        }else{
                            // Create a parent-child relationship with the rel attribute.
                            var $second_level_link = $('<a href="#" class="dimension" rel="d' + dimension_iterator + '_' + hierarchy_iterator + '_' + level_iterator + '" title="' + level['uniqueName'] + '">' + level['caption'] + '</a>')
                            .appendTo($li);
                        }
                    });
                });
                /** After each loop of the dimension make sure that is more than one hierarchy, if not remove the hiearchy. */
                if ($first_level.find('.hierarchy').length == 1) {
                    $first_level.find('.hierarchy').remove();
                }
            }
        });
    },

    /**
     * Populate the measure tree for the selected tab.
     * @param $tab {Object} Selected tab content.
     * @param data {Object} Data object which contains the available measure
     *                      members.
     */
    load_measures : function(tab_index, data, url) {
        /** We need to fetch the measures separetely. */
        var $tab = view.tabs.tabs[tab_index].content;

        // Remove any instances of a tree.
        $tab.find('.measure_tree ul').remove();
        // Create a new measures tree.
        var $measure_tree = $('<ul />').appendTo($tab.find('.measure_tree'));
        $measure_tree.hide();
        // Add the first static measures folder.
        var $measures = $('<li><span class="root expand"><a href="#" title="Measures" rel="m0" class="folder_expand">Measures</a></span></li>')
        .appendTo($measure_tree);
        // Add a child list to the measures list.
        var $measures_ul = $('<ul />').appendTo($measures);

        // Prep measures metadata
        var measure_id = 0;
        delete view.tabs.tabs[tab_index].data['measures'];
        view.tabs.tabs[tab_index].data['measures'] = new Array();

        // Populate the tree with the children of MeasureLevel
        $.each(data, function(i, member) {
            measure_id++;

            $('<li title="' + measure_id + '"><a href="#" class="measure" rel="m0_' + i + '"  title="'+this['uniqueName']+'">'+this['caption']+'</a></li>')
            .mousedown(function() {
                return false;
            }).appendTo($measures_ul);

            view.tabs.tabs[tab_index].data['measures'][measure_id] = {
                'measure': member.uniqueName // member.member
            };
        });
        /** Prepare the workspace. */
        view.prepare_workspace(tab_index);

        // Add a new measure tree.
        var $measure_tree = $('<ul />').appendTo($tab.find('.measure_tree')).addClass('mtree');
        // Populate the tree with first level measures.
        $.each(data, function(i, dimension) {
            if (this['name'] === 'Measures') {
                var $measures = $('<li><span class="root expand"><a href="#" title="Measures" rel="m' + i + '" class="folder_expand">Measures</a></span></li>')
                .appendTo($tab.find('.measure_tree ul'));
                var $measures_ul = $('<ul />').appendTo($measures);
                $.each(dimension.hierarchies[0].levels, function(j, level){
                    $('<li><a href="#" class="measure" rel="m' + i + '_' + j + '"  title="'+this['level']+'">'+this['caption']+'</a></li>')
                    .mousedown(function() {
                        return false;
                    }).appendTo($measures_ul);
                });
            }
        });
    },

    /**
     * Prepare the new query trees and workspace.
     * @param $tab {Object} Selected tab content.
     */
    prepare_workspace: function(tab_index) {

        /** Initisalise trees */
        var $tab = view.tabs.tabs[tab_index].content;
        init_trees($tab);
        $tab.find('.dimension_tree ul:first, .measure_tree ul:first').show();

        /** Tree selectors. */
        var $dimension_tree = $tab.find('.dimension_tree');
        var $measure_tree = $tab.find('.measure_tree');
        var $both_trees = $tab.find('.measure_tree, .dimension_tree');
        var $both_tree_items = $tab.find('.measure_tree ul li ul li, .dimension_tree ul li ul li');

        /** Dropzone selectors. */
        var $both_dropzones = $tab.find('.rows ul, .columns ul, .filter ul');
        var $column_dropzone = $tab.find('.columns ul');
        var $row_dropzone = $tab.find('.rows ul');
        var $filter_dropzone = $tab.find('.filter ul');
        var $sidebar_dropzone = $tab.find('.sidebar');
        var $connectable = $tab.find('.columns > ul, .rows > ul, .filter > ul');
        var $sidebar_accept = $tab.find('.rows li, .columns li, , .filter > ul');

        /** Disable selection. */
        $both_dropzones.find('.placeholder').disableSelection();
        $both_trees.find('ul > li').disableSelection();

        // If the user selects a new query within the same tab.
        /** Remove all dropped items. */
        $both_dropzones.find('li').remove();
        /** Remove the table. */
        $tab.find('.workspace_results table').remove();

        /** Reset all sortable items. */
        $both_dropzones.sortable('reset');

        /** Check the toolbar. */
        view.check_toolbar(tab_index);

        //        /** Double click instead of drag and drop. */
        //        $both_tree_items.dblclick(function(e){
        //
        //
        //
        //            // Prevent default browser action from occuring.
        //            e.preventDefault();
        //            /* Is the user double clicking on a dimension or measure. */
        //            var is_dimension = $(this).find('a').hasClass('dimension'), is_measure = $(this).find('a').hasClass('measure');
        //            /** Only continue if the item is active. */
        //
        //            if ($(this).hasClass('ui-draggable')) {
        //                /** If a measure. */
        //                if (is_measure) {
        //                    /** If the first measure in the dropzone. */
        //                    if ($both_dropzones.find('.d_measure').length == 0) {
        //                        /** By default add the measure to the column dropzone. */
        //                        $(this).clone().appendTo($column_dropzone).addClass('d_measure');
        //                        /** Continue adding the measure. */
        //                        add_measure($tab, $(this).find('a').attr('rel'));
        //                    }else{
        //                        /** Append the measure to the last measure available. */
        //                        $(this).clone().insertAfter($both_dropzones.find('.d_measure').last()).addClass('d_measure');
        //                        /** Continue adding the measure. */
        //                        add_measure($tab, $(this).find('a').attr('rel'));
        //                    }
        //                    /** When stopped dropping or sorting set the selection. */
        //                    model.dropped_item($(this), true);
        //                }else if(is_dimension) {
        //                    /** Add the dimension to the row dropzone manually. */
        //                    $(this).clone().appendTo($row_dropzone).addClass('d_dimension');
        //                    /** Continue adding the dimension. */
        //                    add_dimension($tab, $(this).find('a').attr('rel'));
        //                    /** When stopped dropping or sorting set the selection. */
        //                    model.dropped_item($(this), true);
        //                }
        //                /** Refresh the sortables. */
        //                $both_dropzones.sortable('refresh');
        //
        //            } else if ($(this).hasClass('not-draggable')) {
        //                if (is_measure) {
        //                    /** Remove the measure manually. */
        //                    $both_dropzones.find('[rel=' + $(this).find('a').attr('rel') +']').parent().remove();
        //                    /** Continue removing the measure. */
        //                    remove_measure($tab, $(this).find('a').attr('rel'));
        //                } else if(is_dimension) {
        //                    /** Remove the dimension manually. */
        //                    $both_dropzones.find('[rel=' + $(this).find('a').attr('rel') +']').parent().remove();
        //                    /** Continue removing the measure. */
        //                    remove_dimension($tab, $(this).find('a').attr('rel'));
        //                }
        //                /** Refresh the sortables. */
        //                $both_dropzones.sortable('refresh');
        //                /** When dimension or measure is removed, set the selection. */
        //                model.removed_item($(this), true);
        //
        //                // If automatic query execution is enabled, rerun the query after making change
        //                if (view.tabs.tabs[tab_index].data['options']['automatic_execution']) {
        //                    if($row_dropzone.find('li.d_measure, li.d_dimension').length > 0 && $column_dropzone.find('li.d_measure, li.d_dimension').length > 0) {
        //                        model.run_query(tab_index);
        //                    }
        //                }
        //
        //                view.check_toolbar(tab_index);
        //
        //            }
        //        });


        /** Activate all items for selection. */
        // FIXME - this should be added when the item is dragged to avoid page fragments
        /*$tab.find('.rows ul li a, .columns ul li a, .filter ul li a').live('dblclick', function() {
            if ($(this).hasClass('dimension')) {
                var $tab = $(this).closest(".tab");
                model.show_selections($(this), $tab);
            }

            return false;
        });*/

        // Make the both the column and row dropzones 'droppable'
        $both_dropzones.sortable({
            connectWith: $tab.find('.connectable'),
            cursorAt: {
                top: 10,
                left: 35
            },
            forcePlaceholderSize: true,
            items: '> li',
            opacity: 0.60,
            placeholder: 'placeholder',
            tolerance: 'pointer',

            start: function(event, ui) {
                // Replace the placeholder text
                ui.placeholder.text(ui.helper.text());
            },

            beforeStop: function(event, ui) {

                // Make sure that the user is not trying to remove an item
                if(!(ui.item.hasClass('dropped'))) {

                    // Which axis is the user sorting from and to
                    if($(this).parent().hasClass('rows')) {
                        var sort_to = 'columns', sort_from = 'rows';
                        var is_measure = ui.item.hasClass('d_measure');
                    }else{
                        var sort_to = 'rows', sort_from = 'columns';
                        var is_measure = ui.item.hasClass('d_measure');
                    }

                    // Set between lists to false
                    var between_lists = false;

                    // If the user is sorting a measure make the axis the user is sorting to does not already have a measure
                    if ($('.'+sort_to).find('.d_measure').length == 1 && $('.'+sort_from).find('.d_measure').length > 0 && is_measure) {
                        // If the axis already has a measure than make sure they are grouped
                        $('.'+sort_to).find('.d_measure').last().after($('.'+sort_from).find('.d_measure'));
                        // Set sorting between lists to true
                        between_lists = true;
                    }

                    // Is the user sorting a measure or a dimension?
                    var is_dimension = ui.item.find('a').hasClass('dimension')
                    , is_measure = ui.item.find('a').hasClass('measure');

                    // What is on the right and the left of the placeholder (where the user will stop sorting)
                    var left_item = $(this).find('.placeholder').prev().prev()
                    , right_item = $(this).find('.placeholder').next();

                    var left_item_dim
                    , right_item_dim;

                    // Is there a dimension on the left and/or on the right?
                    if(left_item.length > 0 && is_dimension) {
                        // Work out the dimension group on the left
                        left_item_dim = left_item.find('a').attr('rel').split('_')[0];
                    }
                    if(right_item.length > 0 && is_dimension) {
                        // Work out the dimension group on the right
                        right_item_dim = right_item.find('a').attr('rel').split('_')[0];
                    }
					
                    /*
                     * Sorting a dimension and NOT between lists
                     */
                    if (is_dimension && !(between_lists)){
						
                        // Step 1.
                        // Declare variables

                        var user_dim_group, user_dim_group_order,
                        user_dim_in_hierarchy = false,
                        dropzone_dim_array = [],
						dropzone_dim_array_new = [],
                        dropzone_dim_group,
                        placement_order;
						
                        // Step 2.
                        // Populate variables

                        user_dim = ui.item.find('a').attr('rel');
                        user_dim_group = ui.item.find('a').attr('rel').split('_')[0],
                        user_dim_group_order = ui.item.find('a').attr('rel').split('_')[2];

                        // Step 3.
                        // Check if the dimension the user is sorting doesn't already have other
                        // levels within the same hierarchy on both dropzones

                        if($both_dropzones.find('a[rel^=' + user_dim_group + ']').length > 1) {
                            user_dim_in_hierarchy = true;
                        }

                        // Step 4.
                        // Check if the user is moving a dimension from one axis to another axis
                        // If the ui.item has the class d_dimension we know it is being sorted between
                        // axis and has dimensions within the same level.

                        if(ui.item.hasClass('d_dimension') && user_dim_in_hierarchy) {
							
							// Loop through all dimensions belonging to the same level and store them in array
							// including the new dimension just being sorted.
							$both_dropzones.find('a[rel^=' + user_dim_group + ']').each(function(i, value) {
									
									if($(this).attr('rel') != user_dim) {
									
										dropzone_dim_array.push({
												order: $(this).attr('rel').split('_')[2] ,
												rel: $(this).attr('rel')
										});
										
									}
									
							});
															
							// Is the dimension being sorted between two dimensions outside of the level?
							// We will need to move this dimension and any levels attached to it to the
							// end of the group.
							
							var dim_on_the_left = $both_dropzones.find('li a[rel='+user_dim+']').parent().prev().find('a').attr('rel')
							dim_on_the_right = $both_dropzones.find('li a[rel='+user_dim+']').parent().next().next().find('a').attr('rel');
							
							/** HOW TO DETECT IF SORTING WITHIN A GROUP - SHOULD NOT BE ALLOWED **/
							
							// If there is something on both the right and left
							if(	typeof dim_on_the_left != 'undefined' && typeof dim_on_the_right  != 'undefined'
								&& dim_on_the_left.split('_')[0] != user_dim_group && dim_on_the_right.split('_')[0] != user_dim_group) {
													
								if(	dim_on_the_left.split('_')[0] === dim_on_the_right.split('_')[0]
									&& user_dim_group != dim_on_the_left.split('_')[0]) {
									
									// Add the dimension to the end of the group on the right
									$both_dropzones.find('li a[rel^='+dim_on_the_left.split('_')[0]+']').parent().last()
									.append().after(ui.item.css('display', '').addClass('d_dimension'));
									
									// Find all other dimensions part of the same group and add them to the end
									// of the above sorted dimension by looping through an array
									
									$.each(dropzone_dim_array, function(index, value) {
										
										$both_dropzones.find('a[rel=' + user_dim + ']').parent().append()
										.after($both_dropzones.find('a[rel='+dropzone_dim_array[index]['rel']+']').parent());
										
									});
									
									
								}
							
							// If there is something on the right only
							}else if(	typeof dim_on_the_left === 'undefined' && typeof dim_on_the_right  != 'undefined'
										&& dim_on_the_right.split('_')[0] != user_dim_group) {
																	
								$.each(dropzone_dim_array, function(index, value) {
										
										$both_dropzones.find('a[rel=' + user_dim + ']').parent().append()
										.after($both_dropzones.find('a[rel='+dropzone_dim_array[index]['rel']+']').parent());
										
								});
							
							// If there is something on the left only
							}else if(	typeof dim_on_the_right === 'undefined' && typeof dim_on_the_left != 'undefined'
										&& dim_on_the_left.split('_')[0] != user_dim_group) {
								
								$.each(dropzone_dim_array, function(index, value) {
										
										$both_dropzones.find('a[rel=' + user_dim + ']').parent().append()
										.after($both_dropzones.find('a[rel='+dropzone_dim_array[index]['rel']+']').parent());
										
								});
							
							// Else we can assume it is by itself on the axis
							}else if(typeof dim_on_the_left === 'undefined' && typeof dim_on_the_right  === 'undefined'){
															
								$.each(dropzone_dim_array, function(index, value) {
										
										$both_dropzones.find('a[rel=' + user_dim + ']').parent().append()
										.after($both_dropzones.find('a[rel='+dropzone_dim_array[index]['rel']+']').parent());
										
								});
							
							}else{
									
								$both_dropzones.find('a[rel^=' + user_dim_group + ']').parent().tsort('a[rel]',{
									returns: true, 
									attr: 'rel',
									order: 'asc'
								});
								
							}
							
													
							// Let the server know to add the dimension
                            add_dimension($tab, ui.item.find('a').attr('rel'));
														
                        }else if(user_dim_in_hierarchy && !(ui.item.hasClass('d_dimension'))) {
												
                            // Step 5a (If user_dim_in_hierarchy = true)
                            // Decide where to place the user sorted dimension

                            // Loop through all dimensions in the same hierarchy on the dropzones

                            $both_dropzones.find('a[rel^=' + user_dim_group + ']').each(function(i, value) {

                                // Add to an array, dropzone_dim_array
								if($(this).attr('rel') != user_dim) {
									dropzone_dim_array.push({
										order: $(this).attr('rel').split('_')[2] ,
										rel: $(this).attr('rel')
									});
								}

                            });

                            // Loop through the array and see where the user sorted dimension sits

                            $.each(dropzone_dim_array, function(index, value) {

                                // Make sure the dimension being sorted isn't being references in the array.
                                if(user_dim != dropzone_dim_array[index]['rel']) {

                                    // Is the dimension the user sorting lower than the dimension on the dropzone
                                    // in the current hierarchy?
                                    if(user_dim_group_order < dropzone_dim_array[index]['order'] && user_dim_group != dropzone_dim_array[index]['rel']) {

                                        // Set a pointer up to know we have to add in the dimension
                                        // before this item
                                        dropzone_dim_group = dropzone_dim_array[index]['rel'];
                                        placement_order = 'before';

                                    }else {

                                        // Set a pointer up to know we have to add in the dimension
                                        // after this item
                                        dropzone_dim_group = dropzone_dim_array[index]['rel'];
                                        placement_order = 'after';

                                    }

                                }

                            });

                            // Where should the UI place the dimension? Before or After?
                            if(placement_order === 'before') {

                                $both_dropzones.find('li a[rel='+dropzone_dim_group+']')
                                .parent()
                                .append()
                                .before(ui.item.css('display', '').addClass('d_dimension'));

                            }else{

                                $both_dropzones.find('li a[rel='+dropzone_dim_group+']')
                                .parent()
                                .append()
                                .after(ui.item.css('display', '').addClass('d_dimension'));

                            }
							
                            // Let the server know to add the dimension
                            add_dimension($tab, ui.item.find('a').attr('rel'));

                        }else{

                            // Step 5b (If user_dim_in_hierarchy = false)

                            // Step 5bi
                            // If the user has placed the dimension between two measures
                            // then add to the end of the measures

                            if(left_item.hasClass('d_measure') && right_item.hasClass('d_measure')) {

                                $(this).find('li')
                                .last()
                                .append()
                                .after(ui.item.css('display', '').addClass('d_dimension'));

                                // Let the server know to add the dimension
                                add_dimension($tab, ui.item.find('a').attr('rel'));
							
							// Check if there is a dimension on either side of the item being sorted
							// from the same dimension group
                            }else{
								
								// If there are dimensions on either side of the sorted dimension belonging to the same
								// level then make sure you move it to the last dimension in the group.
								
								var dim_on_the_left, dim_on_the_right, lowest_dim, lowest_dim_order = 0;
								if(ui.item.prev().children().length > 0 && ui.item.next().next().children().length > 0) {
									
									// Setup pointers to the left and right dimensions
									dim_on_the_left = ui.item.prev().children().attr('rel').split('_')[0];
									dim_on_the_right = ui.item.next().next().children().attr('rel').split('_')[0];
									
									// Loop through all dimensions in the level, which the user has sorted the solo dimension
									// inbetween								
									$both_dropzones.find('a[rel^=' + dim_on_the_left + ']').each(function(i, value) {
										if(lowest_dim_order < $(this).attr('rel').split('_')[2]) {
											lowest_dim_order = $(this).attr('rel').split('_')[2];
											lowest_dim = $(this).attr('rel');
										}
										
									});
									
									// Add it to the end of the lowest dimension in the group
									$both_dropzones.find('a[rel=' + lowest_dim + ']').parent().append().after(ui.item.css('display', '').addClass('d_dimension'));
									
									// Let the server know to add the dimension
									add_dimension($tab, ui.item.find('a').attr('rel'));
								
								
								}else{
														
									// Step 5bii
									// Add as normal
									ui.item.css('display', '').addClass('d_dimension');

									// Let the server know to add the dimension
									add_dimension($tab, ui.item.find('a').attr('rel'));
									
								}

                            }

                        }

                    }else if (!(between_lists)) {

                        // If sorting a measure from the tree to a dropzone

                        // If the measure is being dropped in between dimensions in a group
						
						if(left_item.length > 0 && right_item.length > 0 && left_item_dim === right_item_dim) {

                            // Find any other measures and add it to end of them
                            if($both_dropzones.find('.d_measure').length > 0) {

                                $both_dropzones.find('.d_measure').append().after(ui.item.css('display','').addClass('d_measure'));

                            }else{

                                // Append to the end of the dimensions in the dropzone
                                $both_dropzones.find('a[rel^=' + left_item_dim + ']')
                                .last().parent().append().after(ui.item.css('display', '')
                                    .addClass('d_measure'));
                            }

                        // If this is the first measure being sorted
                        }else if ($both_dropzones.find('.d_measure').length == 0) {

                            ui.item.css('display','').addClass('d_measure');

                        }else{

                            // Is there measures on the right or on the left of the measure then act as normal
                            if ((left_item.hasClass('d_measure') || right_item.hasClass('d_measure') || (left_item.hasClass('d_measure') && right_item.hasClass('d_measure')))) {

                                ui.item.css('display','').addClass('d_measure');

                            }else{

                                // If not, find all the other measures and add the user sorted measure to the end
                                $both_dropzones.find('.d_measure').insertAfter($('.placeholder'));

                                ui.item.css('display','').addClass('d_measure');

                            }
                        }

                        // Let the server know to add the measure
                        add_measure($tab, ui.item.find('a').attr('rel'));
                    }
                }
            },
            stop: function(event, ui) {
                /** Is the item being removed. */
                if(!(ui.item.hasClass('dropped'))) {
                    /** When stopped dropping or sorting set the selection. */
                    model.dropped_item(ui.item, false, ui);
                    // If something is being dropped onto the filter axis and is not a measure.
                    if(ui.item.parent().parent().hasClass('filter') && ui.item.hasClass('d_dimension')) {
                        model.show_selections(ui.item.find('a'),$(this).closest(".tab"));
                    }
                }
            }

        }).disableSelection();

        /** Make the measure and dimension tree draggable. */
        $both_tree_items.draggable({
            cancel: '.not-draggable, .hierarchy, .used',
            connectToSortable: $connectable,
            helper: 'clone',
            opacity: 0.60,
            tolerance: 'pointer',
            cursorAt: {
                top: 10,
                left: 35
            }
        });

        /** Make the sidebar droppable. */
        $sidebar_dropzone.droppable({
            accept: '.d_measure, .d_dimension',
            drop: function(event, ui) {
                /** Add the drop class so that the sortable functions. */
                ui.draggable.addClass('dropped');
                /** Is the item being removed is a measure or is all the measures. */
                if (ui.draggable.find('a').hasClass('measure')) {
                    /** Remove the measure. */
                    remove_measure($tab, ui.draggable.find('a').attr('rel'), true);
                }else{
                    /** Remove the dimension. */
                    remove_dimension($tab, ui.draggable.find('a').attr('rel'));
                }

                // Remove item from query
                model.removed_item(ui.draggable);

                /** Remove the draggable measure. */
                ui.draggable.remove();
                // Patch needed for IE to work.
                setTimeout(function() {
                    /** Remove the draggable measure. */
                    ui.draggable.remove();
                },1);
            /** When dimension or measure is removed, set the selection. */


            /** Activate all items for selection.
                // FIXME - this should be added when the item is dragged to avoid page fragments
                $('.rows ul li a, .columns ul li a,  .filter ul li a').live('dblclick', function() {
                    if ($(this).hasClass('dimension')) {
                        var $tab = $(this).closest(".tab");
                        model.show_selections($(this), $tab);
                    }

                    return false;
                });
             */
            }
        });

        /**
     * Active dimension and measure trees.
     */
        function init_trees($tab) {
            /** Activate hide and show on trees. */
            $tab.find('.dimension_tree').find('ul li ul').hide();
            /** When the root item is clicked show it's children. */
            $tab.find('.root').click(function(e) {
                e.preventDefault();
                $(this).parent().find('ul').toggle();
                if ($(this).hasClass('expand')) {
                    $(this).removeClass('expand').addClass('collapsed')
                    .find('a.folder_expand')
                    .removeClass('folder_expand')
                    .addClass('folder_collapsed');
                }else{
                    $(this).removeClass('collapsed').addClass('expand')
                    .find('a.folder_collapsed')
                    .removeClass('folder_collapsed')
                    .addClass('folder_expand');
                }
                return false;
            });
        }

        /**
     * Add a dimension.
     * @param id {String} The rel attribute of the link being clicked which
     * identifies the dimension.
     */
        function add_dimension($tab, id) {

            /* Make sure we are referencing the tab being used */
            var $dimension_tree = $tab.find('.dimension_tree');

            /** Find the parent dimension id. */
            var parent_id = id.split('_')[0];

            if($dimension_tree.find('[rel=' + id + ']').parent().hasClass('used')) {
                $dimension_tree.find('[rel=' + id + ']').parent().addClass('reuse');
            }

            /** Disable all of the dimension's siblings and highlight the dimension being used. */
            $dimension_tree.find('[rel=' + id + ']').parent().addClass('used');
            /** removeClass('ui-draggable').addClass('not-draggable'); This will enable multiple level selections */

            /** Highlight the dimension's parent being used. */
            // If reuse of the item is true i.e. are we sorting between lists
            $dimension_tree.find('[rel=' + parent_id + ']').parent().addClass('used');
            /** Collapse the dimension parent if it is exapnded. */
            //            if ($dimension_tree.find('[rel=' + parent_id + ']').parent().hasClass('expand')) {
            //                /** Toggle the children of the dimension's parent. */
            //                $dimension_tree.find('[rel=' + parent_id + ']').parent().parent().find('ul').toggle();
            //                /** Style the parent dimension. */
            //                $dimension_tree.find('[rel=' + parent_id + ']').parent()
            //                .removeClass('expand').addClass('collapsed')
            //                .find('a.folder_expand').removeClass('folder_expand').addClass('folder_collapsed');
            //            }
            view.check_toolbar(tab_index);
        }

        /**
     * Remove a dimension.
     * @param id {String} The rel attribute of the dimension being removed.
     */
        function remove_dimension($tab, id) {

            /* Make sure we are referencing the tab being used */
            var $dimension_tree = $tab.find('.dimension_tree');

            /** Find the parent dimension id. */
            var parent_id = id.split('_')[0];
            $dimension_tree.find('[rel=' + id + ']').parent().removeClass('used reuse');

            /** Enable all of the dimension's siblings and unhighlight the dimension being used. */
            if ($dimension_tree.find('[rel=' + parent_id + ']').parent().parent().find('li').hasClass('used') == false) {
                $dimension_tree.find('[rel=' + parent_id + ']').parent().removeClass('used');

            //                .removeClass('expand').addClass('collapsed')
            //                .find('a.folder_expand').removeClass('folder_expand').addClass('folder_collapsed');
            }
            /** Remove the dimension's highlighted member. */
            /** Collapse the dimension parent if it is exapnded. */
            view.check_toolbar(tab_index);
        }

        /**
     * Add a measure.
     * @param id {String} The rel attribute of the link being clicked which
     * identifies the measure.
     */
        function add_measure($tab, id) {

            /* Make sure we are referencing the tab being used */
            var $measure_tree = $tab.find('.measure_tree');

            /** Disable and highlight the measure. */
            $measure_tree.find('[rel=' + id + ']').parent()
            .removeClass('ui-draggable').addClass('used not-draggable');
            $measure_tree.find('.root').addClass('used');
            view.check_toolbar(tab_index);
        }

        /**
     * Remove a measure.
     * @param id {String} The rel attribute of the measure being removed.
     * @param is_drop {Boolean} If the measure is being dropped.
     */
        function remove_measure($tab, id, is_drop) {

            /* Make sure we are referencing the tab being used */
            var $measure_tree = $tab.find('.measure_tree');

            /** Disable and highlight the measure. */
            $measure_tree.find('[rel=' + id + ']').parent()
            .removeClass('used not-draggable').addClass('ui-draggable');
            if ($both_dropzones.find('.d_measure').length == 0) {
                $measure_tree.find('.root').removeClass('used');
            }else if ($both_dropzones.find('.d_measure').length == 1 && is_drop) {
                $measure_tree.find('.root').removeClass('used');
            }
            view.check_toolbar(tab_index);
        }

    },

    /**
 * Displays a waiting message and blocks the user from performing any actions.
 * @param msg {String} Message to be displayed to the user.
 * @param block_div {Boolean} If blocking a specific tab or the whole viewport.
 * @param tab_index {Integer} Index of the active tab.
 */
    show_processing : function (msg, block_div, tab_index) {
        if(block_div) {
            var $active_tab = view.tabs.tabs[tab_index].content;
            $active_tab.unblock();
            $active_tab.block({
                message: '<div class="processing"><div class="processing_inner"><span class="processing_image">&nbsp;</span>' + msg + '</div></div>',
                overlayCSS:  {
                    backgroundColor: '#FFF',
                    opacity:         0.5
                },
                baseZ: 100000
            });
        }else{
            $.unblockUI();
            $.blockUI({
                message: '<div class="processing"><div class="processing_inner"><span class="processing_image">&nbsp;</span>' + msg + '</div></div>',
                overlayCSS:  {
                    backgroundColor: '#FFF',
                    opacity:         0.5
                }
            });
        }
    },

    /**
 * Hides the waiting message.
 * @param block_div {Boolean} If blocking a specific tab or the whole viewport.
 * @param tab_index {Integer} Index of the active tab.
 */
    hide_processing : function(block_div, tab_index) {
        if (block_div) {
            view.tabs.tabs[tab_index].content.unblock();
        }else{
            $.unblockUI();
        }
    },

    /**
 * Load views into a dialog template
 * @param url {String} The url where the view is located.
 */
    show_view : function(url, callback) {
        // Append a dialog <div/> to the body.
        $('<div id="dialog" class="selections dialog hide" />').appendTo('body');
        // Load the view into the dialog <div/> and disable caching.
        $.ajax({
            url : BASE_URL + url,
            cache : true,
            dataType : "html",
            success : function(data) {
                $('#dialog').html(data).modal({
                    opacity : 100,
                    onClose : function (dialog) {
                        // Remove all simple modal objects.
                        dialog.data.remove();
                        dialog.container.remove();
                        dialog.overlay.remove();
                        $.modal.close();
                        // Remove the #dialog which we appended to the body.
                        $('#dialog').remove();
                    }
                });

                if (callback)
                    callback();
            }
        });
    },

    /**
 * Loads a pop up dialog box for alerting.
 * @param title {String} Title to be displayed in the dialog box.
 * @param message {String} Message to be displayed in the dialog box.
 */
    show_dialog : function (title, message, type) {

        // Check if there is already a dialog box
        if($('#dialog').length > 0) {
        // Do nothing
        }else {
            if(type === 'mdx'){
                var message = '<textarea readonly="yes" wrap="hard">' + message + '</textarea>';
            }
            // Append a dialog <div/> to the body.
            $('<div id="dialog" class="dialog hide">').appendTo('body');
            // Add the structure of the dialog.
            $('#dialog').append('<div class="dialog_inner">' +
                '<div class="dialog_header">' +
                '<h3>' + title + '</h3>' +
                '<a href="#" title="Close" class="close_dialog close">Close</a>' +
                '<div class="clear"></div>' +
                '</div>' +
                '<div class="dialog_body_' + type + '">' + message + '</div>' +
                '<div class="dialog_footer calign"><a href="#" class="close form_button">&nbsp;OK&nbsp;</a>' +
                '</div>' +
                '</div>').modal({
                opacity : 100,
                onClose : function (dialog) {
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
    },


    /**
 * Check if the toolbar can be enabled or disabled.
 */
    check_toolbar: function(tab_index) {

        // Make sure we are referencing the tab being used.
        $tab = view.tabs.tabs[tab_index].content;
        $column_dropzone = $tab.find('.columns ul');
        $row_dropzone = $tab.find('.rows ul');
        var row_dropzone_items = $row_dropzone.find('li.d_measure, li.d_dimension').length;
        var col_dropzone_items = $column_dropzone.find('li.d_measure, li.d_dimension').length;
        var query_name = view.tabs.tabs[tab_index].data['query_name'].length;


        // No query name (no cube selected).
        if (query_name == 0) {
            // Add the disabled_toolbar class to all icons.
            $tab.find('.workspace_toolbar li a').addClass('disabled_toolbar');
            // Clear the results area.
            $tab.find('.workspace_results').html('');
            puc.allowSave(false);
        }else if ((query_name > 0 && col_dropzone_items == 0 && row_dropzone_items == 0)
            || (query_name > 0 && (col_dropzone_items > 0 && row_dropzone_items == 0))
            || (query_name > 0 && (col_dropzone_items == 0 && row_dropzone_items > 0))) {

            // If there is a query name BUT no items on ROWS and/or COLUMNS.
            // Add the disabled_toolbar class to all icons.
            $tab.find('.workspace_toolbar li a').addClass('disabled_toolbar');

            // This means users can setup specific query options i.e. Non Empty, Auto Exec.
            // by removing the disabled_toolbar class.s
            $tab.find('.workspace_toolbar li')
            .find('a[href="#automatic_execution"], a[href="#toggle_fields"], a[href="#non_empty"]')
            .removeClass('disabled_toolbar');
            puc.allowSave(false);

        }else if (query_name > 0 && col_dropzone_items > 0 && row_dropzone_items > 0) {

            // If there is a query name AND items on ROWS and COLUMNS
            // Remove disabled_toolbar class from all icons.
            $tab.find('.workspace_toolbar li a').removeClass('disabled_toolbar');
            puc.allowSave(true);
        }else{

            // Add the disabled_toolbar class to all icons.
            $tab.find('.workspace_toolbar li a').addClass('disabled_toolbar');
            // Clear the results area.
            $tab.find('.workspace_results').html('');
            puc.allowSave(false);
        }

        if($tab.find('.workspace_results td').length > 0) {
            $tab.find('.workspace_toolbar li')
            .find('a[href="#export_xls"], a[href="#export_csv"], a[href="#save_query"]').removeClass('disabled_toolbar');
            puc.allowSave(true);

        }

        $tab.find('.workspace_toolbar li').find('a[href="#switch_to_mdx"],a[href="run_mdx"]').removeClass('disabled_toolbar');

        model.load_properties(tab_index);
    }

};

view.init();

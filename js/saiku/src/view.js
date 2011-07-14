var view = {


    /** Initialise the user interface. */
    draw_ui : function () {

        // Patch for webkit browsers to stop the text cursor appearing
        // when dragging items.
        document.onselectstart = function () {
            return false;
        };

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
            .appendTo($list_element);
        });
    },

        
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


        /** Make the dropzones sortable. */
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
                /** Replace the placeholder text. */
                ui.placeholder.text(ui.helper.text());
            },

            beforeStop: function(event, ui) {
                /** Is the item being removed. */
                if(!(ui.item.hasClass('dropped'))) {
                    /** Determine the sorting to and from axis. */
                    if($(this).parent().hasClass('rows')) {
                        var sort_to = 'columns', sort_from = 'rows';
                        var is_measure = ui.item.hasClass('d_measure');
                    }else{
                        var sort_to = 'rows', sort_from = 'columns';
                        var is_measure = ui.item.hasClass('d_measure');
                    }
                    /** Set sorting between lists to false. */
                    var between_lists = false;
                    /** Check if sorting a measure, does the axis accepting the sort have a measure already. */
                    if ($('.'+sort_to).find('.d_measure').length == 1 && $('.'+sort_from).find('.d_measure').length > 0 && is_measure) {
                        /** Move all measures from rows to columns. */
                        $('.'+sort_to).find('.d_measure').last().after($('.'+sort_from).find('.d_measure'));
                        /** Set sorting between lists to true. */
                        between_lists = true;
                    }
                    /** Sorting a dimension or measure. */
                    var is_dimension = ui.item.find('a').hasClass('dimension');
                    var is_measure = ui.item.find('a').hasClass('measure');
                    /** What is on the left and right of the placeholder. */
                    var left_item = $(this).find('.placeholder').prev().prev(), right_item = $(this).find('.placeholder').next();
                    /** Sorting a dimension. */
                    if (is_dimension){
                        /** If the placeholder is in between measures. */
                        if(left_item.hasClass('d_measure') && right_item.hasClass('d_measure')) {
                            /** Find the last item and append it to the end of the list. */
                            $(this).find('li').last().append().after(ui.item.css('display', '').addClass('d_dimension'));
                        }else{
                            /** Act as normal. */
                            ui.item.css('display', '').addClass('d_dimension');
                        }
                        /** Continue adding the dimension. */
                        add_dimension($tab, ui.item.find('a').attr('rel'));
                    }else if (!(between_lists)) {
                        /** If sorting a measure and is not between lists. */
                        /** If this is the first measure. */
                        if ($both_dropzones.find('.d_measure').length == 0) {
                            /** Act as normal. */
                            ui.item.css('display','').addClass('d_measure');
                        }else{ /** Is there a measure on the left or right or ( measure on left and right ). */
                            if ((left_item.hasClass('d_measure') || right_item.hasClass('d_measure') || (left_item.hasClass('d_measure') && right_item.hasClass('d_measure')))) {
                                /** Act as normal. */
                                ui.item.css('display','').addClass('d_measure');
                            }else{
                                /** If not then find all other measures insert them after the measure being sorted. */
                                $both_dropzones.find('.d_measure').insertAfter($('.placeholder'));
                                ui.item.css('display','').addClass('d_measure');
                            }
                        }
                        /** Continue adding the measure. */
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
            cancel: '.not-draggable, .hierarchy',
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
            }
        });

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
            $dimension_tree.find('[rel=' + id + ']').parent().addClass('used')
            .parent().children().removeClass('ui-draggable').addClass('not-draggable');
            /** removeClass('ui-draggable').addClass('not-draggable'); This will enable multiple level selections */
            
            /** Highlight the dimension's parent being used. */
            // If reuse of the item is true i.e. are we sorting between lists
            $dimension_tree.find('[rel=' + parent_id + ']').parent().addClass('used');
            /** Collapse the dimension parent if it is exapnded. */
            if ($dimension_tree.find('[rel=' + parent_id + ']').parent().hasClass('expand')) {
                /** Toggle the children of the dimension's parent. */
                $dimension_tree.find('[rel=' + parent_id + ']').parent().parent().find('ul').toggle();
                /** Style the parent dimension. */
                $dimension_tree.find('[rel=' + parent_id + ']').parent()
                .removeClass('expand').addClass('collapsed')
                .find('a.folder_expand').removeClass('folder_expand').addClass('folder_collapsed');
            }
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
            /** Enable all of the dimension's siblings and unhighlight the dimension being used. */
            $dimension_tree.find('[rel=' + parent_id + ']').parent().removeClass('used').parent().find('li')
            .removeClass('not-draggable').addClass('ui-draggable');
            /** Remove the dimension's highlighted parent. */
            $dimension_tree.find('[rel=' + id + ']').parent().removeClass('used reuse');
            /** Collapse the dimension parent if it is exapnded. */
            if ($dimension_tree.find('[rel=' + parent_id + ']').parent().hasClass('expand')) {
                /** Toggle the children of the dimension's parent. */
                $dimension_tree.find('[rel=' + parent_id + ']').parent().parent().find('ul').toggle();
                /** Style the parent dimension. */
                $dimension_tree.find('[rel=' + parent_id + ']').parent()
                .removeClass('expand').addClass('collapsed')
                .find('a.folder_expand').removeClass('folder_expand').addClass('folder_collapsed');
            }
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
        model.load_properties(tab_index);



    }

};

view.init();

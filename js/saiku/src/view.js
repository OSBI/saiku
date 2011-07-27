var view = {

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

        
};
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
 * @fileOverview    This represents the tab module for Saiku UI.
 * @description     This will handle all interaction with Saiku UI tabs.
 * @version         1.0.0
 */

/**
 * Object for containing tab metadata.
 * @class
 */
var Tab = function(tab_selector, content_selector) {
    this.tab = tab_selector;
    this.content = content_selector;
    this.data = {};
};

/**
 * Container object used for tracking tabs.
 * @class
 */
var TabContainer = function(tab_container, content_container) {
    $("<ul />").appendTo(tab_container);
    this.tab_container = tab_container.find("ul");
    this.content_container = content_container;
    this.tabs = new Array();
    this.selected = 0;

    /** Counts active tabs. */
    this.active_tabs = function() {
        active_tabs = 0;
        for (i = 0; i < this.tabs.length; i++) {
            if (typeof this.tabs[i] != "undefined") {
                active_tabs++;
            }
        }
        return active_tabs;
    };

    /** Remove a tab and reclaim memory. */
    this.remove_tab = function(index, is_queries) {

        // Delete the query associated with the tab
        if(!is_queries) {
            model.delete_query(index);
        }

        // Remove the tab and associated metadata
        if (typeof this.tabs[index] != "undefined") {
            this.tabs[index].tab.remove();
            this.tabs[index].content.remove();
            delete this.tabs[index].data;
            delete this.tabs[index];
        }

        // Find the next tab and select it.
        for (next_tab = index; next_tab < this.tabs.length; next_tab++) {
            if (typeof this.tabs[next_tab] != "undefined") {
                this.select_tab(next_tab);
                return;
            }
        }
        // Check and make sure there are any tabs at all.
        if (this.active_tabs() == 0) {
            // Create one if not.
            this.add_tab();
            return;
        }
        // If the last tab was removed, select the next to last tab.
        this.select_tab(this.index_from_tab(this.tab_container.find("li:last")));

        // Resize tabs
        view.resize_height(this.index_from_tab(this.tab_container.find("li:last")));
    };

    /** Change the selected tab. */
    this.select_tab = function(index) {
        if (typeof this.tabs[index] != "undefined") {
            this.tab_container.find("li.selected").removeClass("selected");
            this.content_container.find(".tab").hide();
            this.tabs[index].tab.addClass("selected");
            this.tabs[index].content.show();
            view.resize_height(index);
            this.selected = index;
        }
    };

    /** Add a tab. */
    this.add_tab = function() {
        // Create the tab itself
        var new_index = this.tabs.length;
        var $new_tab = $("<li />").data("tab_index", new_index);
        var $new_tab_link = $("<a />")
        .html("Unsaved query (" + (new_index + 1) + ")")
        .appendTo($new_tab);
        var $new_tab_closer = $("<span>Close Tab</span>")
        .addClass("close_tab")
        .appendTo($new_tab);
        $new_tab.appendTo(this.tab_container);

        // Create the content portion of the tab.
        $new_tab_content = $('<div />')
        .addClass("tab")
        .data("tab_index", new_index)
        .load(BASE_URL + "views/queries/index.html", function() {
            view.load_cubes(new_index);
            view.resize_height(new_index);
            
            // Bind event handler to workspace toolbar methods
            $new_tab_content.find('.workspace_toolbar a').click(function(event) {
                return controller.workspace_toolbar_click_handler($(this));
            });
            if (PLUGIN == "true") {
                $new_tab_content.find(PLUGIN_REMOVE_CONTENT).remove();
                if (typeof REDUCED != "undefined" && REDUCED) { 
                    $new_tab_content.find('.sidebar_separator').hide();
                    $new_tab_content.find('.workspace_fields').hide();
                    $new_tab_content.find('.sidebar').css('width', 0);
                    $new_tab_content.find('.workspace_inner').css('margin-left', 0);
                }

            }
            
            // Localize UI controls
            $('.i18n').i18n(po_file);
        });


        $new_tab_content.appendTo(this.content_container);
        
        // Register the new tab with the TabContainer.
        this.tabs.push(new Tab($new_tab, $new_tab_content));
        this.select_tab(new_index);

        // Set default options
        this.tabs[new_index].data['options'] = {
            'nonempty': true,
            'automatic_execution': true
        };
        
        return new_index;
    };

    /** Open a new query tab */
    this.open_query_tab = function(callback) {

        if($('#tabs').find('#queries').length == 0) {

            // Create the tab itself
            var new_index = this.tabs.length;

            var $new_tab = $("<li />")
            .data("tab_index", new_index)
            .attr('id', 'queries');
            var $new_tab_link = $("<a />")
            .html("Repository")
            .appendTo($new_tab)
            .click(function() {
                model.get_queries(new_index);
            });

            var $new_tab_closer = $("<span>Close Tab</span>")
            .addClass("close_tab")
            .appendTo($new_tab);


            $new_tab.appendTo(this.tab_container);

            // Create the content portion of the tab.
            $new_tab_content = $('<div />')
            .addClass("tab")
            .data("tab_index", new_index)
            .load(BASE_URL + "views/queries/open.html", function() {
                model.get_queries(new_index);
                view.resize_height(new_index);

                // Localize UI controls
                $('.i18n').i18n(po_file);
            });
            $new_tab_content.appendTo(this.content_container);

            // Register the new tab with the TabContainer.
            this.tabs.push(new Tab($new_tab, $new_tab_content));
            this.select_tab(new_index);

            // Set default options
            this.tabs[new_index].data['options'] = {
            };
        } else {
            var tab_index = $('#tabs').find('#queries').index();
            this.select_tab(tab_index);
            model.get_queries(tab_index);
        }
    };

    /** Empty the tab container (used for logout) */
    this.clear_tabs = function() {
        for (i = 0; i < this.tabs.length; i++) {
            if (typeof this.tabs[i] != 'undefined') {
                this.remove_tab(i);
            }
        }
    };

    /** Determine whether or not the TabContainer is empty .*/
    this.is_empty = function() {
        // If the array is uninitialized, obviously return true
        if (this.tabs.length == 0)
            return true;
        // Check to see if there are any active tabs
        for (i = 0; i < this.tabs.length; i++) {
            if (typeof this.tabs[i] != 'undefined') {
                // An active tab still exists, return false
                return false;
            }
        }
        // If not, return true
        return true;
    };

    /** Get a tab_index from a tab instance. */
    this.index_from_tab = function($tab) {
        tab_index = $tab.data("tab_index");
        if (tab_index !== null) {
            return tab_index;
        } else {
            throw "Invalid tab";
        }
    };

    /** Get a tab_index from a tab content. */
    this.index_from_content = function($content) {
        tab_index = $content.data("tab_index");
        if (tab_index !== null) {
            return tab_index;
        } else {
            throw "Invalid tab";
        }
    };
};
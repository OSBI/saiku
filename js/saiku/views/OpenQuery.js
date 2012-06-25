/*
 * OpenQuery.js
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
 * The open query tab (Repository viewer)
 */
var OpenQuery = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .query': 'view_query',
        'dblclick .query': 'select_and_open_query',
        'click .add_folder' : 'add_folder',
        'click li.folder': 'toggle_folder',
        'click .workspace_toolbar a.open': 'open_query',
        'click .workspace_toolbar [href=#edit_folder]': 'edit_folder',
        'click .workspace_toolbar [href=#delete_folder]': 'delete_folder',
        'click .workspace_toolbar [href=#delete_query]': 'delete_query'
    },
    
    template: function() {
        return _.template($("#template-open-dialog").html())();        
    },

    template_repository_objects: function( repository ) {
        var self = this;
        $(this.el).find('.sidebar ul').html(
            _.template( $( '#template-repository-objects' ).html( ) )( {
                repoObjects: repository
            } ) 
        );
    },
    
    caption: function() {
        return "Repository";
    },
    
    render: function() {
        // Load template
        $(this.el).html(this.template());
        
        // Adjust tab when selected
        this.tab.bind('tab:select', this.fetch_queries);
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
        
        return this; 
    },
    
    initialize: function(args) {
        // Maintain `this`
        _.bindAll(this, "adjust", "fetch_queries",
                "clear_query","select_and_open_query");
        
        // Initialize repository
        this.repository = new Repository({}, { dialog: this });
    },
    
    fetch_queries: function() {
        this.repository.fetch();
    },
    
    populate: function( repository ) {
        var self = this;
        self.template_repository_objects( repository );
        self.queries = {};
        function getQueries( entries ) {
            _.forEach( entries, function( entry ) {
                if( entry.type === 'FILE' ) {
                    self.queries[ entry.path ] = entry;
                } else {
                    getQueries( entry.repoObjects );
                }
            } );
        }
        getQueries( repository );
    },
    
    view_query: function(event) {
        event.preventDefault( );
        var $currentTarget = $( event.currentTarget );
        var $target = $currentTarget.find('a');
        this.unselect_current_selected( );
        $currentTarget.addClass( 'selected' );
        var path = $target.attr('href').replace('#', '');
        var name = $target.text();
        var query = this.queries[path];
        
        $(this.el).find('.workspace_toolbar').removeClass( 'hide' );
        $( this.el ).find( '.for_folder' ).addClass( 'hide' );
        $( this.el ).find( '.for_queries' ).removeClass( 'hide' );
        
        var $results = $(this.el).find('.workspace_results')
            .html('<h3><strong>' + query.name + '</strong></h3>');
        var $properties = $('<ul id="query_info" />').appendTo($results);
        
        // Iterate through properties and show a key=>value set in the information pane
        for (var property in query) {
            if (query.hasOwnProperty(property) && property != "name") {
                $properties.append($('<li />').html("<strong>" + 
                        property + "</strong> : " + query[property]));
            }
        }
        
        this.selected_query = new SavedQuery({ file: path, name: name });
        
        return false;
    },

    view_folder: function( event ) {
        var $target = $( event.currentTarget ).find( 'a' );
        var name = $target.attr( 'href' ).replace( '#', '' );

        $( this.el ).find( '.workspace_toolbar' ).removeClass( 'hide' )
        $( this.el ).find( '.for_queries' ).addClass( 'hide' );
        $( this.el ).find( '.for_folder' ).removeClass( 'hide' );

        $( this.el ).find( '.workspace_results' )
            .html( '<h3><strong>' + name + '</strong></h3>' );

        this.selected_query = new SavedQuery({ file: name , name: name });

    },

    add_folder: function( event ) {
        (new AddFolderModal({ 
            success: this.clear_query 
        })).render().open();

        return false;
    },

    toggle_folder: function( event ) {
        var $target = $( event.currentTarget );
        this.unselect_current_selected( );
        $target.addClass( 'selected' );
        var $queries = $target.find( 'ul' );
        var isClosed = $queries.hasClass( 'hide' );
        if( isClosed ) {
            $target.find( '.sprite' ).removeClass( 'collapsed' );
            $queries.removeClass( 'hide' );
        } else {
            $target.find( '.sprite' ).addClass( 'collapsed' );
            $queries.addClass( 'hide' );
        }

        this.view_folder( event );

        return false;
    },

    select_and_open_query: function(event) {
        var $target = $(event.currentTarget).find('a');
        var path = $target.attr('href').replace('#', '');
        var name = $target.text();
        this.selected_query = new SavedQuery({ file: path, name: path });
        this.open_query();
    },
    
    open_query: function(event) {
        Saiku.ui.block("Opening query...");
        this.selected_query.fetch({ 
            success: this.selected_query.move_query_to_workspace,
            error: function() { Saiku.ui.unblock(); },
            dataType: "text"
        });
        
        return false;
    },

    delete_query: function(event) {
        (new DeleteRepositoryObject({
            query: this.selected_query,
            success: this.clear_query
        })).render().open();
        
        return false;
    },
    
    edit_folder: function( event ) {
        alert( 'todo: edit folder properties/permissions' );
        return false;
    },
    
    delete_folder: function( event ) {
        (new DeleteRepositoryObject({
            query: this.selected_query,
            success: this.clear_query
        })).render().open();
        return false;
    },

    clear_query: function() {
        $(this.el).find('.workspace_toolbar').addClass('hide');
        $(this.el).find('.workspace_results').html('');
        this.fetch_queries();
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
        $(this.el).find('.sidebar').height($("body").height() - 87);
        
        // Adjust the dimensions of the results window
        $(this.el).find('.workspace_results').css({
            width: $(document).width() - $(this.el).find('.sidebar').width() - 30,
            height: $(document).height() - $("#header").height() -
                $(this.el).find('.workspace_toolbar').height() - 
                $(this.el).find('.workspace_fields').height() - 40
        });
    },
    
    toggle_sidebar: function() {
        // Toggle sidebar
        $(this.el).find('.sidebar').toggleClass('hide');
        var new_margin = $(this.el).find('.sidebar').hasClass('hide') ?
                5 : 265;
        $(this.el).find('.workspace_inner').css({ 'margin-left': new_margin });
    },

    unselect_current_selected: function( ) {
        $( this.el ).find( 'li.selected' ).removeClass( 'selected' );
    }

});

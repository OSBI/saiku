/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
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
        'click .workspace_toolbar [href=#delete_query]': 'delete_query',
        'click .workspace_toolbar [href=#edit_permissions]': 'edit_permissions',
        'click .queries' : 'click_canvas'
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
                self.queries[ entry.path ] = entry;
                if( entry.type === 'FOLDER' ) {
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
        $( this.el ).find( '.workspace_toolbar' ).removeClass( 'hide' );
        $( this.el ).find( '.for_queries' ).addClass( 'hide' );
        $( this.el ).find( '.for_folder' ).addClass( 'hide' );
        $( this.el ).find( '.add_folder' ).parent().addClass( 'hide' );

        if (typeof query.acl != "undefined" && _.indexOf(query.acl, "READ") > -1) {
            $( this.el ).find( '.for_queries .open' ).parent().removeClass( 'hide' );
        }
        if (typeof query.acl != "undefined" && _.indexOf(query.acl, "WRITE") > -1) {
            $( this.el ).find( '.for_queries .delete' ).parent().removeClass( 'hide' );
        }
        if (typeof query.acl != "undefined" && _.indexOf(query.acl, "GRANT") > -1) {
            $( this.el ).find( '.for_queries .edit_permissions' ).parent().removeClass( 'hide' );
        }
        
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
        var $target = $( event.currentTarget ).children('div').children('a');
        var path = $target.attr('href').replace('#', '');
        var name = $target.text();
        var folder = this.queries[path];
        $( this.el ).find( '.workspace_toolbar' ).removeClass( 'hide' );
        $( this.el ).find( '.add_folder' ).parent().addClass( 'hide' );
        $( this.el ).find( '.for_queries' ).addClass( 'hide' );
        $( this.el ).find( '.for_folder' ).addClass( 'hide' );

        if (typeof folder.acl != "undefined" && _.indexOf(folder.acl, "WRITE") > -1) {
            $( this.el ).find( '.for_folder .delete' ).parent().removeClass( 'hide' );
            $( this.el ).find( '.add_folder' ).parent().removeClass( 'hide' );
        }
        if (typeof folder.acl != "undefined" && _.indexOf(folder.acl, "GRANT") > -1) {
            $( this.el ).find( '.for_folder .edit_permissions' ).parent().removeClass( 'hide' );
        }

        $( this.el ).find( '.workspace_results' )
            .html( '<h3><strong>' + name + '</strong></h3>' );

        this.selected_query = new SavedQuery({ file: path , name: name });

    },

    add_folder: function( event ) {
        $selected = $(this.el).find('.selected');
        var path ="";
        if (typeof $selected !== "undefined" && $selected) {
            if ($selected.hasClass('folder_row')) {
                path = $selected.children('a').attr('href');
                path = path.length > 1 ? path.substring(1,path.length) : path; 
                path+= "/";

            } else if ($selected.hasClass('query') && !$selected.parent().hasClass('RepositoryObjects')) {
                var query = $selected.find('a');
                path = query.attr('href');
                var queryname = query.text();
                path = path.substring(1, path.length - queryname.length );
            }
        }
        
        (new AddFolderModal({ 
            path: path,
            success: this.clear_query 
        })).render().open();

        return false;
    },

    click_canvas: function(event) {
        var $target = $( event.currentTarget );
        if ($target.hasClass('sidebar')) {
            $(this.el).find('.selected').removeClass('selected');
        }
        $( this.el ).find( '.add_folder' ).parent().removeClass( 'hide' );
        return false;
    },

    toggle_folder: function( event ) {
        var $target = $( event.currentTarget );
        this.unselect_current_selected( );
        $target.children('.folder_row').addClass( 'selected' );
        var $queries = $target.children( '.folder_content' );
        var isClosed = $target.children( '.folder_row' ).find('.sprite').hasClass( 'collapsed' );
        if( isClosed ) {
            $target.children( '.folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $queries.removeClass( 'hide' );
        } else {
            $target.children( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
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

    edit_permissions: function(event) {
        (new PermissionsModal({
            workspace: this.workspace,
            title: "Permissions",
            file: this.selected_query.get('file')
        })).open();
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
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    }

});

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
 * The save query dialog
 */
var OpenDialog = Modal.extend({
    type: "save",
    closeText: "Open",

    events: {
        'click': 'select_root_folder', /* select root folder */
        'click .dialog_footer a:' : 'call',
        'click .query': 'select_name',
        'dblclick .query': 'open_query',
        'click li.folder': 'toggle_folder',
        'keyup .search_file' : 'search_file',
        'click .cancel_search' : 'cancel_search'
    },
    
    buttons: [
        { id: "test", text: "Open", method: "open_query" },
        { text: "Cancel", method: "close" }
    ],

    initialize: function(args) {
        // Append events
        var self = this;
        var name = "";
        this.message = '<div style="height:25px; line-height:25px;"><b><span class="i18n">Search:</span></b> &nbsp;'
                + ' <span class="search"><input type="text" class="search_file"></input><span class="cancel_search"></span></span></div>'
                + "<div class='RepositoryObjects'>Loading....</div><br><b><div class='query_name'><span class='i18n'>Please select a file.....</span></div></b>"
        _.extend(this.options, {
            title: "Open"
        });

        // Initialize repository
        this.repository = new Repository({}, { dialog: this });

        this.bind( 'open', function( ) {
            var height = ( $( "body" ).height() / 2 ) + ( $( "body" ).height() / 6 );
            if( height > 420 ) {
                height = 420;
            }
            $(this.el).find('.RepositoryObjects').height( height );
            $(this.el).dialog( 'option', 'position', 'center' );
            $(this.el).parents('.ui-dialog').css({ width: "550px" });
            $(this.el).find('.dialog_footer').find('a[href="#open_query"]').hide();

            self.repository.fetch( );
        } );


        // Maintain `this`
        _.bindAll( this, "close", "toggle_folder", "select_name", "populate" , "cancel_search")

    
    },

    populate: function( repository ) {
        $( this.el ).find( '.RepositoryObjects' ).html(
            _.template( $( '#template-repository-objects' ).html( ) )( {
                repoObjects: repository
            } ) 
        );
    },

    select_root_folder: function( event ) {
        var isNameInputField = $( event.target ).attr( 'name' ) === 'name';
        if( !isNameInputField ) {
            this.unselect_current_selected_folder( );
        }
    },

    toggle_folder: function( event ) {
        var $target = $( event.currentTarget );
        this.unselect_current_selected_folder( );
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
        return false;
    },

    select_name: function( event ) {
        var $currentTarget = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $currentTarget.parent( ).parent( ).has( '.folder' ).children('.folder_row').addClass( 'selected' );
        var name = $currentTarget.find( 'a' ).attr('href');
        name = name.replace('#','');
        $(this.el).find('.query_name').html( name );
        $(this.el).find('.dialog_footer').find('a[href="#open_query"]').show();
        return false;
    },

    unselect_current_selected_folder: function( ) {
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    },

    // XXX - duplicaten from OpenQuery
    search_file: function(event) {
        var filter = $(this.el).find('.search_file').val().toLowerCase();
        var isEmpty = (typeof filter == "undefined" || filter == "" || filter == null);
        if (isEmpty || event.which == 27 || event.which == 9) {
            this.cancel_search();
        } else {
            if ($(this.el).find('.search_file').val()) {
                $(this.el).find('.cancel_search').show();
            } else {
                $(this.el).find('.cancel_search').hide();
            }
            $(this.el).find('li.query').removeClass('hide')
            $(this.el).find('li.query a').filter(function (index) { 
                return $(this).text().toLowerCase().indexOf(filter) == -1; 
            }).parent().addClass('hide');
            $(this.el).find('li.folder').addClass('hide');
            $(this.el).find('li.query').not('.hide').parents('li.folder').removeClass('hide');
            //$(this.el).find( 'li.folder .folder_content').not(':has(.query:visible)').parent().addClass('hide');

            //not(':contains("' + filter + '")').parent().hide();
            $(this.el).find( 'li.folder .folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $(this.el).find( 'li.folder .folder_content' ).removeClass('hide');
        }
        return false;
    },
    cancel_search: function(event) {
        $(this.el).find('input.search_file').val('');
        $(this.el).find('.cancel_search').hide();
        $(this.el).find('li.query, li.folder').removeClass('hide');
        $(this.el).find( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
        $(this.el).find( 'li.folder .folder_content' ).addClass('hide');
        $(this.el).find('.search_file').val('').focus();
        $(this.el).find('.cancel_search').hide();

    },

    open_query: function(event) {
        // Save the name for future reference
        var $currentTarget = $( event.currentTarget );
        var file = $(this.el).find('.query_name').html();
        if ($currentTarget.hasClass('query')) {
            file = $currentTarget.find( 'a' ).attr('href').replace('#','');
        }

        var selected_query = new SavedQuery({ file: file });
        this.close();
        Saiku.ui.block("Opening query...");
        selected_query.fetch({ 
            success: selected_query.move_query_to_workspace,
            error: function() { Saiku.ui.unblock(); },
            dataType: "text"
        });


        event.preventDefault();
        return false;
    }
});

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
        'click li.folder': 'toggle_folder'
    },
    
    buttons: [
        { id: "test", text: "Open", method: "open_query" },
        { text: "Cancel", method: "close" }
    ],

    initialize: function(args) {
        // Append events
        var self = this;
        var name = "";
        this.message = "<div class='RepositoryObjects'>Loading....</div><div class='query_name'></div>"
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
            $(this.el).parents('.ui-dialog').css({ width: "500px" });
            $(this.el).find('.dialog_footer').find('a[href="#open_query"]').hide();

            self.repository.fetch( );
        } );


        // Maintain `this`
        _.bindAll( this, "close", "toggle_folder", "select_name", "populate" )

    
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

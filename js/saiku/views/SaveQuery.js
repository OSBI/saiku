/*
 * SaveQuery.js
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
 * The save query dialog
 */
var SaveQuery = Modal.extend({
    type: "save",
    closeText: "Save",

    events: {
        'click': 'select_root_folder', /* select root folder */
        'click .dialog_footer a:' : 'call',
        'submit form': 'save',
        'click .query': 'select_name',
        'click li.folder': 'toggle_folder'
    },
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],

    initialize: function(args) {
        // Append events
        var self = this;
        var name = "";
        if (args.query.name) {
            name = args.query.name.split('/')[args.query.name.split('/').length -1];
        }
        this.query = args.query;
        this.message = _.template("<form id='save_query_form'>" +
            "<label for='name'>To save a new query, " + 
            "please select a folder and type a name in the text box below:</label><br />" +
            "<div class='RepositoryObjects'></div>" +
            "<input type='text' name='name' value='<%= name %>' />" +
            "</form>")({ name: name });

        _.extend(this.options, {
            title: "Save query"
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
            self.repository.fetch( );
        } );

        // Maintain `this`
        _.bindAll( this, "copy_to_repository", "close", "toggle_folder", "select_name", "populate" );
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
        var name = $currentTarget.find( 'a' ).text();
        $(this.el).find('input[name="name"]').val( name );
        return false;
    },

    unselect_current_selected_folder: function( ) {
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    },

    save: function(event) {
        // Save the name for future reference
        var foldername = ''; /* XXX == root, should it be something different than ''? */
        var $folder = $(this.el).find( '.folder_row.selected a' ).first( );
        if( $folder.length ) {
            foldername = $folder.attr( 'href' ).replace( '#', '' );
            foldername = (foldername != null && foldername.length > 0 ? foldername + "/" : "");
        }
        
        var name = $(this.el).find('input[name="name"]').val();
        if (name != null && name.length > 0) {
            this.query.set({ name: name, folder: foldername });
            this.query.trigger('query:save');
            $(this.el).find('form').html("Saving query...");
            this.query.action.get("/xml", {
                success: this.copy_to_repository
            });
        } else {
            alert("You need to enter a name!");
        }
        
        event.preventDefault();
        return false;
    },
    
    copy_to_repository: function(model, response) {
        var folder = this.query.get('folder');
        var file = this.query.get('name').indexOf(".saiku") == this.query.get('name').length - 6 ? this.query.get('name') : this.query.get('name') + ".saiku";
        file = folder + file;
        (new SavedQuery({
            name: this.query.get('name'),
            file: file,
            content: response.xml
        })).save({ success: this.close });
    }
});

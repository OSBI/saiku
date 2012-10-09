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
        
        // fix event listening in IE < 9
        if($.browser.msie && $.browser.version < 9) {
            $(this.el).find('form').on('submit', this.save);    
        }

    
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
        var self = this;
        var folder = this.query.get('folder');
        var file = this.query.get('name').indexOf(".saiku") == this.query.get('name').length - 6 ? this.query.get('name') : this.query.get('name') + ".saiku";
        file = folder + file;
        var error = function(data, textStatus, jqXHR) {
                if (textStatus && textStatus.status == 403 && textStatus.responseText) {
                    alert(textStatus.responseText);
                } else {
                    self.close();
                }
                return true;
        };

        (new SavedQuery({
            name: this.query.get('name'),
            file: file,
            content: response.xml
        })).save({},{ success:  this.close, error: error  });
    }
});

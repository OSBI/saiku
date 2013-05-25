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
        'click li.folder': 'toggle_folder',
        'keyup .search_file' : 'search_file',
        'click .cancel_search' : 'cancel_search'
    },
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],

    folder_name: null,
    file_name: null,

    initialize: function(args) {
        // Append events
        var self = this;
        var name = "";
        var full_path = "";
        if (args.query.name) {
            var full_path = args.query.name;
            var path = args.query.name.split('/');

            name = path[path.length -1];
            this.file_name = name;
            if (path.length > 1) {
                this.folder_name = path.splice(0,path.length - 1).join("/");
            }
        }
        this.query = args.query;
        this.message = _.template('<div style="height:25px; line-height:25px;"><b><span class="i18n">Search:</span></b> &nbsp;' +
                ' <span class="search"><input type="text" class="search_file"></input><span class="cancel_search"></span></span></div>' +
            "<form id='save_query_form'>" +
            "<div class='RepositoryObjects'></div>" +
            "<br /><label for='name' class='i18n'>File:</label>&nbsp;" +
            "<input type='text' name='name' value='<%= name %>' /> <span class='save sprite'></span>" +
            "</form>")({ name: full_path });

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
            $(this.el).parents('.ui-dialog').css({ width: "550px" });
            self.repository.fetch( );
        } );

        // Maintain `this`
        _.bindAll( this, "copy_to_repository", "close", "toggle_folder", "select_name", "populate", "set_name", "cancel_search" );
        
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
        var f_name = $target.find( 'a' ).attr('href').replace('#', '');
        this.set_name(f_name, null);


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

    set_name: function(folder, file) {
        if (folder != null) {
            this.folder_name = folder;
            var name = (this.folder_name != null ? this.folder_name + "/" : "") + (this.file_name != null ? this.file_name : "")
            $(this.el).find('input[name="name"]').val( name );
        }
        if (file != null) {
            $(this.el).find('input[name="name"]').val( file );
        }

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




    select_name: function( event ) {
        var $currentTarget = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $currentTarget.parent( ).parent( ).has( '.folder' ).children('.folder_row').addClass( 'selected' );
        var name = $currentTarget.find( 'a' ).attr('href').replace('#','');
        this.set_name(null, name);
        return false;
    },

    unselect_current_selected_folder: function( ) {
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    },

    save: function(event) {
        // Save the name for future reference
        var foldername = ''; /* XXX == root, should it be something different than ''? */
        /*
        var $folder = $(this.el).find( '.folder_row.selected a' ).first( );
        if( $folder.length ) {
            foldername = $folder.attr( 'href' ).replace( '#', '' );
            foldername = (foldername != null && foldername.length > 0 ? foldername + "/" : "");
        }
        */
        
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
        var file = this.query.get('name');
        file = file.length > 6 && file.indexOf(".saiku") == file.length - 6 ? file : file + ".saiku";
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

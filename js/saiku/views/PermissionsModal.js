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
 * Dialog for member selections
 */
var PermissionsModal = Modal.extend({
    type: "permissions",
    
    buttons: [
        { text: "Ok", method: "ok" },
        { text: "Cancel", method: "close" }
    ],

    events: {
        'click .add_role': 'add_role',
        'click .remove_acl' : 'remove_acl',
        'submit form': 'add_role',
        'click a': 'call',

    },

    rolesacl : {},

    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = args.title;
        this.file = args.file;
        this.rolesacl = {};
        Saiku.ui.unblock();
        _.bindAll(this, "ok", "add_role", "remove_acl");

        // Resize when rendered
        //this.bind('open', this.post_render);
        this.render();
               // Load template
       $(this.el).find('.dialog_body')
          .html(_.template($("#template-permissions").html())(this));

        $(this.el).find('.filterbox').autocomplete({
                    minLength: 1,
                    source: Saiku.session.roles
                }).data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a class='label'>" + item.label + "</a>" )
                    .appendTo( ul );
                };

        var acl = new RepositoryAclObject({ file : this.file });
        acl.fetch({ async: false });

        var definedRoles = (typeof acl.get('roles') == "undefined" || acl.get('roles') == null ? {} : acl.get('roles')); 
        this.rolesacl = definedRoles;
        var templ_roles =_.template($("#template-permissions-rolelist").html())({roles: definedRoles });


        $(this.el).find('.rolelist').html(templ_roles);
		Saiku.i18n.translate();
    },
    
    add_role: function(event) {
        var self = this;
        event.preventDefault();
        var role = $(this.el).find(".filterbox").val();
        var acls = [];
        var aclstring ="";
        var rolecount = 0;
        if (role && role.length > 0) {
            $(this.el).find('.acl:checked').each( function(index) { 
                if (index > 0) {
                    aclstring += ", ";
                }
                rolecount++;
                aclstring += $(this).val();
                acls.push($(this).val());
            });
            if (rolecount > 0) {
                self.rolesacl[role] = acls;
                $("<option value='" + role + "'>" + role + " ["+aclstring+"]</option>").appendTo($(this.el).find(".select_roles"));
                var role = $(this.el).find(".filterbox").val("");
            } else {
                alert("You need to chose at least one ACL method for this role.");
            }
        }
        

        return false;
    },

    remove_acl: function(event) {
        var self = this;
        $(this.el).find(".select_roles option:selected").each( function(index) { 
            delete self.rolesacl[$(this).val()];
        });
        $(this.el).find(".select_roles option:selected").remove();
        return false;
    },

    ok: function() {
        var closer = this.close();
        var acl = { "type" : "SECURED", "roles" : this.rolesacl, "owner" : Saiku.session.username };
        (new RepositoryAclObject({ file: this.file, acl: JSON.stringify(acl)})).save({ success: closer });

        return false;
    }
});
/*
 * plugin.js
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
 * Object which controls save to solution repository
 */
/**
 * Changelog:
 *     2011.12.29 - RNP (rodrigonovo@gmail.com) - replaced the "top." 
 *       reference by the "window.parent" reference. This was done to 
 *       make saiku work in systems where Pentaho runs inside an iframe.
 *
**/

var puc = {
    allowSave: function(isAllowed) {
        if(window.parent.mantle_initialized !== undefined && window.parent.mantle_initialized && 
            window.parent.enableAdhocSave ) {
            if (window.ALLOW_PUC_SAVE === undefined || ALLOW_PUC_SAVE) {
                window.parent.enableAdhocSave(isAllowed);
            }
        }
    },

    refresh_repo: function() {
        if(window.parent.mantle_initialized !== undefined && window.parent.mantle_initialized) {
            window.parent.mantle_refreshRepository();
        }
    },

    save_to_solution: function(filename, solution, path, type, overwrite) {
        var query = Saiku.tabs._tabs[0].content.query;
        query.action.get("/xml", {
            success: function(model, response) {
                (new SavedQuery({
                    name: filename,
                    newname: query.get('name'),
                    xml: response.xml,
                    solution: solution,
                    path: path,
                    action: filename,
                    overwrite: overwrite
                })).save({ success: function() {
                    puc.refresh_repo();
                }});
            }
        });
    }
};

/**
 * Objects required for BI server integration
 */
var RepositoryBrowserControllerProxy = function() {
    this.remoteSave = puc.save_to_solution;
};

var Wiz = function() {
    this.currPgNum = 0;
};

var WaqrProxy = function() {
    this.wiz = new Wiz();
    this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
};

var gCtrlr = new WaqrProxy();

var savePg0 = function() {};

/**
 * Manually start session
 */
if (Settings.BIPLUGIN) {
    Settings.PLUGIN = true;
    Settings.REST_URL = "/pentaho/content/saiku/";

    $(document).ready(function() {
        Saiku.session = new Session();
    });
}

/**
 * Bind callbacks to workspace
 */
var BIPlugin = {
    bind_callbacks: function(workspace) {
        // If in view mode, remove sidebar and drop zones
        if (Settings.MODE == "view" || Settings.MODE == "table") {
            workspace.toggle_sidebar();
            $(workspace.el).find('.sidebar_separator').remove();
            $(workspace.el).find('.workspace_inner')
                .css({ 'margin-left': 0 });
            $(workspace.el).find('.workspace_fields').remove();
        }

        // Remove toolbar buttons
        $(workspace.toolbar.el)
            .find('.save').parent().remove();
        $(workspace.toolbar.el).find('.run').parent().removeClass('seperator');
        if (Settings.MODE == "view" || Settings.MODE == "table") {
            $(workspace.toolbar.el)
                .find(".run, .auto, .toggle_fields, .toggle_sidebar")
                .parent().remove();
        }
        if (Settings.MODE == "table") {
            $(workspace.toolbar.el).parent().remove();
        }

        // Toggle save button
        workspace.bind('query:result', function(args) {
            var isAllowed = args.data.cellset && 
                args.data.cellset.length > 0;
            puc.allowSave(isAllowed);
        });
    }
};

/**
 * If plugin active, customize chrome
 */
Saiku.events.bind('session:new', function(session) {
    if (Settings.PLUGIN) {        
        // Remove tabs and global toolbar
        $('#header').remove();

        // Bind to workspace
        if (Saiku.tabs._tabs[0] && Saiku.tabs._tabs[0].content) {
            BIPlugin.bind_callbacks(Saiku.tabs._tabs[0].content);
        }

        Saiku.session.bind('workspace:new', function(args) {
            BIPlugin.bind_callbacks(args.workspace);
        });
    }
});

var Datasources = Backbone.Model.extend({
    list: [],
        
    initialize: function(args, options) {
        // Attach a custom event bus to this model
        _.extend(this, Backbone.Events);
    },

    parse: function(response) {
        this.set({ 
            list: response
        });
                
        return response;
    },
    url: function() {
        return (Saiku.session.username + "/datasources");
    }
});


if (Settings.PLUGIN) {
    window.parent.getSaikuMdx = function() {
            var myself = this;
            var query = Saiku.tabs._tabs[0].content.query;
            query.clear();
            query.fetch({ 
            success: function(model, response) {
                    var ds = new Datasources();
                    ds.fetch({
                        success: function(dmodel, dresponse) {
                            for (var i = 0; i < dresponse.length; i ++) {
                                if (dresponse[i].name == response.cube.connectionName) {
                                    var urlParts = dresponse[i].properties.location.split(';');
                                    var jndi = "";
                                    var catalog = "";
                                    $.each(urlParts,function(index, value) { 
                                        var prop = value.split('=');
                                        if (prop[0] == "DataSource") {
                                            jndi = prop[1];
                                        }
                                       if (prop[0] == "Catalog") {
                                            catalog = prop[1];
                                        } 
                                    });
                                    var saikuStub = {
                                        connection: dresponse[i].name,
                                        catalog: catalog,
                                        jndi: jndi,
                                        mdx: response.mdx
                                    }
                                    window.parent.saveSaiku(saikuStub);
                                }        
                            }
                        }
                    })
                    
                }
            });
    };
}

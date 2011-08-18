/**
 * Object which controls save to solution repository
 */
var puc = {
    allowSave: function(isAllowed) {
            if(top.mantle_initialized !== undefined && top.mantle_initialized && 
                top.parent.enableAdhocSave ) {
                if (ALLOW_PUC_SAVE === undefined || ALLOW_PUC_SAVE) {
                    top.parent.enableAdhocSave(isAllowed);
                }
            }
    },
    
    refresh_repo: function() {
        if(top.mantle_initialized !== undefined && top.mantle_initialized) {
            top.mantle_refreshRepository();
        }
    },
    
    save_to_solution: function( filename, solution, path, type, overwrite ) {
        model.request({
                method: "GET",
                url: model.username + "/query/" + view.tabs.tabs[0].data.query_name + "/xml",
                dataType: 'xml',
                success: function (query_data, textStatus, jqXHR) {
                    $.ajax({
                        type: "POST",
                        url: "../saiku",
                        success: function (data, textStatus, jqXHR) { 
                            puc.refresh_repo();
                            view.show_dialog('File Saved','');
                        },
                        data: { "solution":solution,
                            "path":path,
                            "action":filename,
                            "query":jqXHR.responseText
                        },
                        contentType: 'application/x-www-form-urlencoded'
                    });
    
    
    
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
    Settings.REST_URL = "/pentaho/content/saiku/plugin/rest/saiku/";
    
    
    $(document).ready(function() {
        Saiku.session = new Session({}, {
            username: "admin",
            password: "admin"
        });
        Saiku.session.get_credentials();
    });
}

/**
 * If plugin active, customize chrome
 */
Saiku.events.bind('session:new', function() {
    if (Settings.PLUGIN) {        
        // Remove tabs and global toolbar
        $('#header').remove();
        
        // Find workspace
        var workspace = Saiku.tabs._tabs[0].content;
        console.log("WORKSPACE", workspace, Settings.MODE);
        
        // If in view mode, remove sidebar and drop zones
        if (Settings.MODE == "view") {
            workspace.toggle_sidebar();
            $(workspace.el).find('.sidebar_separator').remove();
            $(workspace.el).find('.workspace_fields').remove();
        }
        
        // Remove toolbar buttons
        $(workspace.toolbar.el)
            .find('.save').remove();
        if (Settings.MODE == "view") {
            $(workspace.toolbar.el)
                .find(".run, .auto, .toggle_fields, .toggle_sidebar").remove();
        }
    }
});
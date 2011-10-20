/**
 * Object which controls save to solution repository
 */
var puc = {
    allowSave: function(isAllowed) {
        if(top.mantle_initialized !== undefined && top.mantle_initialized && 
            top.parent.enableAdhocSave ) {
            if (window.ALLOW_PUC_SAVE === undefined || ALLOW_PUC_SAVE) {
                top.parent.enableAdhocSave(isAllowed);
            }
        }
    },
    
    refresh_repo: function() {
        if(top.mantle_initialized !== undefined && top.mantle_initialized) {
            top.mantle_refreshRepository();
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
        Saiku.session = new Session({}, {
            username: "admin",
            password: ""
        });
        Saiku.session.check_session();
    });
}

/**
 * Bind callbacks to workspace
 */
var BIPlugin = {
    bind_callbacks: function(workspace) {
        // If in view mode, remove sidebar and drop zones
        if (Settings.MODE == "view") {
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
        if (Settings.MODE == "view") {
            $(workspace.toolbar.el)
                .find(".run, .auto, .toggle_fields, .toggle_sidebar")
                .parent().remove();
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
Saiku.events.bind('session:new', function(args) {
    if (Settings.PLUGIN) {        
        // Remove tabs and global toolbar
        $('#header').remove();
        
        // Bind to workspace
        if (Saiku.tabs._tabs[0] && Saiku.tabs._tabs[0].content) {
            BIPlugin.bind_callbacks(Saiku.tabs._tabs[0].content);
        }
        
        args.session.bind('workspace:new', function(args) {
            BIPlugin.bind_callbacks(args.workspace);
        });
    }
});

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
_.extend(window, {
    WaqrProxy: function() {
        this.wiz = new Wiz();
        this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
    },
    
    gCtrlr: new WaqrProxy(),
    
    Wiz: function() {
        this.currPgNum = 0;
    },
    
    savePg0: function() {},
    
    RepositoryBrowserControllerProxy: function() {
        this.remoteSave = puc.save_to_solution;
    }
});
    
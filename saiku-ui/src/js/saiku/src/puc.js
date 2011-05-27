

var puc = {
    allowSave: function(isAllowed) {
            if( typeof top.mantle_initialized != "undefined" && top.mantle_initialized == true && top.parent.enableAdhocSave ) {
                if (typeof ALLOW_PUC_SAVE == "undefined" || ALLOW_PUC_SAVE) {
                    top.parent.enableAdhocSave(isAllowed);
                }
            }
    },
    
    refresh_repo: function() {
        if( typeof top.mantle_initialized != "undefined" && top.mantle_initialized == true) {
            top.mantle_refreshRepository();
        }
    }
};

// The following code is for Save/Save As functionality

var gCtrlr = new WaqrProxy(); // this is a required variable

// this is a required object
function WaqrProxy() {

    this.wiz = new Wiz();
    this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
    
}

// this is a required object
function Wiz() {
    currPgNum = 0;
}

// this is a required function
function savePg0() {
}

// this is a required object
function RepositoryBrowserControllerProxy() {

    // This function is called after the Save dialog has been used
   this.remoteSave = function( filename, solution, path, type, overwrite ) {
        save_to_solution( filename, solution, path, type, overwrite );

        
    }
}

function save_to_solution( filename, solution, path, type, overwrite ) {
    model.request({
            method: "GET",
            url: model.username + "/query/" + view.tabs.tabs[0].data['query_name'] + "/xml",
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

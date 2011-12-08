/**
 * Dialog for member selections
 */
var DrillthroughModal = Modal.extend({
    type: "drillthrough",
    
    buttons: [
        { text: "Ok", method: "ok" },
        { text: "Cancel", method: "close" }
    ],
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = args.title;
        this.query = args.workspace.query;
        
        this.position = args.position;
        this.action = args.action;
        Saiku.ui.unblock();
        _.bindAll(this, "ok", "drilled");

        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();
               // Load template
       $(this.el).find('.dialog_body')
          .html(_.template($("#template-drillthrough").html())(this));
        // Show dialog
        $(this.el).find('.maxrows').val(this.maxrows);

        
    },
    
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "150px" });
    },
    
    ok: function() {
        // Notify user that updates are in progress
        var $loading = $("<div>Drilling through...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);
        
        var maxrows = $(this.el).find('.maxrows').val();
        var params = "?maxrows=" + maxrows;
        params = params + (typeof this.position !== "undefined" ? "&position=" + this.position : "" );
        if (this.action == "export") {
        var location = Settings.REST_URL +
            Saiku.session.username + "/query/" + 
            this.query.id + "/drillthrough/export/csv" + params;
            this.close();
            window.open(location);
        } else if (this.action == "table") {
            Saiku.ui.block("Executing drillthrough...");
            this.query.action.get("/drillthrough", { data: { position: this.position, maxrows: maxrows }, success: this.drilled } );
            this.close();
        }
        
        return false;
    },

    drilled: function(model, response) {
        Saiku.ui.unblock();
        (new DrillthroughViewModal({
            workspace: this.workspace,
            title: "Drill-Through Result",
            query: this.workspace.query,
            data: response
        })).open();
    },
    
    finished: function() {
        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});
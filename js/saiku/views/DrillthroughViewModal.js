/**
 * Dialog for member selections
 */
var DrillthroughViewModal = Modal.extend({
    type: "drillthroughview",
    
    buttons: [
        { text: "Ok", method: "ok" },
    ],
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = args.title;
        this.options.resizable = true;
        this.query = args.workspace.query;
        this.data = args;
        this.table = new Table({ workspace: this });
        Saiku.ui.unblock();

        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();
        
        // Load template
        $(this.el).find('.dialog_body')
          .html(_.template($("#template-drillthrough-view").html())(this));
        

        
    },
    
    
    post_render: function(args) {

        $(args.modal.el).parent().css({
            height: $(document).height() - 300,
            width: $(document).width() - 100,
            top: 0 - ($(document).height() - 200),
            left: 50
        });
        

        
        $(this.el).find('.workspace_results').css({
            overflow: "auto",
            height:  $(args.modal.el).parent().height() - 100
        }).append($(this.table.el));

        this.table.render(this.data);
        
    },
    
    ok: function() {
        $(this.table.el).remove();
        this.close();
        return false;
    },

    
    finished: function() {
        $(this.el).dialog('destroy').remove();
    }
});
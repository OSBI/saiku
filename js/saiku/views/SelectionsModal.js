var SelectionsModal = Modal.extend({
    type: "selections",
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],
    
    initialize: function(args) {
        _.extend(this, args);
        this.options.title = "Selections for " + this.name;
        
        this.message = _.template($("#template-selections").html())(args);
        
        this.bind('open', this.post_render);
    },
    
    post_render: function(args) {
        console.log("modal", args.modal);
        $(args.modal.el).parents('.ui-dialog').css({ width: "500px" });
    },
    
    save: function() {
        this.close();
    }
});
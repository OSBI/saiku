var SelectionsModal = Modal.extend({
    type: "selections",
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);
        this.options.title = "Selections for " + this.name;
        this.message = _.template($("#template-selections").html())(args);
        _.bindAll(this, "populate");
        
        // Fetch members
        this.members = new Member({
            cube: args.workspace.selected_cube,
            dimension: args.key
        }).fetch({
            success: this.populate
        });
        
        // Resize when rendered
        this.bind('open', this.post_render);
    },
    
    populate: function(model, response) {
        console.log(response);
    },
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "500px" });
    },
    
    save: function() {
        this.close();
    }
});
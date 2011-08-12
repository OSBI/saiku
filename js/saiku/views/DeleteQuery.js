var DeleteQuery = Modal.extend({
    type: "delete",
    
    buttons: [
        { text: "Yes", method: "del" },
        { text: "No", method: "close" }
    ],
    
    initialize: function(args) {
        this.options.title = "Confirm deletion";
        this.query = args.query;
        this.success = args.success;
        this.message = _.template("Are you sure you want to delete <%= name %>?")
            ({ name: this.query.get('name') });
    },
    
    del: function() {
        this.query.id = _.uniqueId("query_");
        this.query.destroy({
            success: this.success,
            error: this.error
        });
        this.close();
    },
    
    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not delete query");
    }
});
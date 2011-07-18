var Table = Backbone.Model.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        this.workspace.bind('query_result', this.render);
    },
    
    render: function(args) {
        $(args.workspace.el).find('.workspace_results')
            .html("Response: " + JSON.stringify(args.data));
    }
});
var Chart = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data");
        this.workspace.bind('query:result', this.render);
    },
    
    render: function() {
        $(this.el).html('This is my super fancy chart');
    },
    
    process_data: function() {
        
    }
});

Saiku.session.bind("workspace:new", function(args) {
    args.workspace.chart = new Chart({ workspace: args.workspace });
});
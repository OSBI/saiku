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

(function() {
    function new_workspace(args) {
        args.workspace.chart = new Chart({ workspace: args.workspace });
    }
    
    /**
     * Bind events necessary for plugin to operate
     */
    function bind_events() {
        // Attach chart to existing tabs
        for (var i = 0; i < Saiku.tabs._tabs.length; i++) {
            new_workspace({ workspace: Saiku.tabs._tabs[i].content });
        }
        
        // Attach chart to future tabs
        Saiku.session.bind("workspace:new", new_workspace);      
    }
    
    /**
     * Load YUI3 and initialize charts
     */
    $.getScript(
        "https://ajax.googleapis.com/ajax/libs/yui/3.3.0/build/yui/yui-min.js", 
        bind_events
    );
}());
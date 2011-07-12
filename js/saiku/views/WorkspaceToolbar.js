var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
    },
    
    template: function() {
        return Saiku.template.get('WorkspaceToolbar')();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    },
    
    call: function(event) {
        // Determine callback
        var callback = event.target.hash.replace('#', '');
        
        // Attempt to call callback
        try {
            ! $(event.target).hasClass('disabled_toolbar') && this[callback](event);
        } catch (e) {
            console && 
                console.log("Could not fire " + callback + ": " + e.message);
        }
        
        return false;
    },
    
    save_query: function(event) {
        // TODO - save query
    },
    
    automatic_execution: function(event) {
        // Change property
        var new_value = ! this.workspace.query.properties
            .get('saiku.olap.query.automatic_execution');
        this.workspace.query.properties.set({
            'saiku.olap.query.automatic_execution': new_value
        });
        console.log(this.workspace.query.properties);
        
        // Toggle state of button
        $(event.target).toggleClass('on');
    }
});
var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in callbacks
        _.bindAll(this, "call");
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
        ! $(event.target).hasClass('disabled_toolbar') && this[callback](event);
        
        return false;
    },
    
    save_query: function(event) {
        // TODO - save query
    },
    
    automatic_execution: function(event) {
        // Change property
        this.workspace.query.properties
            .toggle('saiku.olap.query.automatic_execution');
        
        // Toggle state of button
        $(event.target).toggleClass('on');
    }
});
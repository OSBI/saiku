var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in callbacks
        _.bindAll(this, "call", "reflect_properties", "run_query");
        
        // Redraw the toolbar to reflect properties
        this.bind('properties_loaded', this.reflect_properties);
        
        // Fire off workspace event
        this.workspace.trigger('workspace::toolbar', { 
            workspace: this.workspace
        });
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
        ! $(event.target).hasClass('disabled_toolbar') 
            && this[callback] && this[callback](event);
        
        return false;
    },
    
    reflect_properties: function() {
        var properties = this.workspace.query.properties.properties;
        
        // Set properties appropriately
        if (properties['saiku.olap.query.nonempty'] === 'true') {
            $(this.el).find('.non_empty').addClass('on');
        }
        if (properties['saiku.olap.query.automatic_execution'] === 'true') {
            $(this.el).find('.auto').addClass('on');
        }
    },
    
    save_query: function(event) {
        // TODO - save query
    },
    
    run_query: function(event) {
        this.workspace.query.run(true);
    },
    
    automatic_execution: function(event) {
        // Change property
        this.workspace.query.properties
            .toggle('saiku.olap.query.automatic_execution').update();
        
        // Toggle state of button
        $(event.target).toggleClass('on');
    },
    
    toggle_fields: function(event) {
        $(this.workspace.el).find('.workspace_fields').toggle();
    },
    
    non_empty: function(event) {
        // Change property
        this.workspace.query.properties
            .toggle('saiku.olap.query.nonempty')
            .toggle('saiku.olap.query.nonempty.rows')
            .toggle('saiku.olap.query.nonempty.columns')
            .update();
    
        // Toggle state of button
        $(event.target).toggleClass('on');
        
        // Run query
        this.workspace.query.run();
    }
});
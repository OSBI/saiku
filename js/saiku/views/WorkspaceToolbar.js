var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in callbacks
        _.bindAll(this, "call", "reflect_properties", "run_query",
            "swap_axes_on_dropzones", "display_drillthrough");
        
        // Redraw the toolbar to reflect properties
        this.workspace.bind('properties:loaded', this.reflect_properties);
        
        // Fire off workspace event
        this.workspace.trigger('workspace:toolbar:render', { 
            workspace: this.workspace
        });
        
        // Activate buttons when a new query is created or run
        this.workspace.bind('query:new', this.activate_buttons);
        this.workspace.bind('query:result', this.activate_buttons);
    },
    
    activate_buttons: function(args) {
        if (args.data && args.data.length > 0) {
            $(args.workspace.toolbar.el).find('.button')
                .removeClass('disabled_toolbar');            
        } else {
            $(args.workspace.toolbar.el).find('.button')
                .addClass('disabled_toolbar');
            $(args.workspace.toolbar.el)
                .find('.auto,.non_empty,.toggle_fields,.toggle_sidebar')
                .removeClass('disabled_toolbar');
        }
    },
    
    template: function() {
        return _.template($("#template-workspace-toolbar").html())();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    },
    
    call: function(event) {
        // Determine callback
        var callback = event.target.hash.replace('#', '');
        
        // Attempt to call callback
        if (! $(event.target).hasClass('disabled_toolbar') && this[callback]) {
            this[callback](event);
        }
        
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
        if (this.workspace.query) {
            (new SaveQuery({ query: this.workspace.query })).render().open();
        }
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
    
    toggle_sidebar: function() {
        this.workspace.toggle_sidebar();
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
    },
    
    swap_axis: function(event) {
        // Swap axes
        Saiku.ui.block("Swapping axes...");
        this.workspace.query.action.put("/swapaxes", { 
            success: this.swap_axes_on_dropzones
        });
    },
    
    drillthrough: function(event) {
        Saiku.ui.block("Executing drillthrough...");
        this.workspace.query.action.get("/drillthrough:500", {
            success: this.display_drillthrough
        });
    },
    
    display_drillthrough: function(model, response) {
        this.workspace.table.render({ data: response });
        Saiku.ui.unblock();
    },
    
    swap_axes_on_dropzones: function() {
        $columns = $(this.workspace.drop_zones.el).find('.columns')
            .children()
            .detach();
        $rows = $(this.workspace.drop_zones.el).find('.rows')
            .children()
            .detach();
            
        $(this.workspace.drop_zones.el).find('.columns').append($rows);
        $(this.workspace.drop_zones.el).find('.rows').append($columns);
        
        this.workspace.query.run();
        Saiku.ui.unblock();
    },
    
    show_mdx: function(event) {
        this.workspace.query.action.get("/mdx", { 
            success: function(model, response) {
                (new MDXModal({ mdx: response })).render().open();
            }
        });
    },
    
    export_xls: function(event) {
        window.location = Settings.REST_URL +
            Saiku.session.username + "/query/" + 
            this.workspace.query.id + "/export/xls";
    },
    
    export_csv: function(event) {
        window.location = Settings.REST_URL +
            Saiku.session.username + "/query/" + 
            this.workspace.query.id + "/export/csv";
    }
});
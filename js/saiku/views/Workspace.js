var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query',
        'drop': 'remove_dimension'
    },
    
    template: function() {
        return Saiku.template.get('Workspace')({
            cube_navigation: Saiku.session.cube_navigation
        });        
    },
    
    render: function() {
        // Load template
        $(this.el).html(this.template());
        
        // Generate toolbar
        this.toolbar.render();
        $(this.el).find('.workspace_toolbar').append($(this.toolbar.el));
        
        // Generate drop zones
        this.drop_zones.render();
        $(this.drop_zones.el)
            .insertAfter($(this.el).find('.workspace_toolbar'));
        
        // Activate sidebar for removing elements
        $(this.el).find('.sidebar')
            .droppable({
                accept: '.d_measure, .d_dimension'
            });
        
        // Add results table
        $(this.el).find('.workspace_results')
            .append($(this.table.el));
        
        return this; 
    },
    
    clear: function() {
        // Prepare the workspace for a new query
        $(this.el).find('.workspace_results table,.connectable')
            .html('');
            
        // Trigger clear event
        this.trigger('workspace:clear');
    },
    
    initialize: function(args) {
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "adjust", "toggle_sidebar", 
                "flash_cube_navigation", "new_query");
                
        // Attach an event bus to the workspace
        _.extend(this, Backbone.Events);
        
        
        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar({ workspace: this });
        this.tab = args.tab;
        
        // Create drop zones
        this.drop_zones = new WorkspaceDropZone({ workspace: this });
        
        // Generate table
        this.table = new Table({ workspace: this });
        
        // Adjust tab when selected
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
        
        // Flash cube navigation when rendered
        this.tab.bind('tab:rendered', this.flash_cube_navigation);
        
        // Fire off new workspace event
        Saiku.session.trigger('workspace:new', { workspace: this });
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
        $(this.el).find('.sidebar').height($("body").height() - 87);
        
        // Adjust the dimensions of the results window
        $(this.el).find('.workspace_results').css({
            width: $(this.el).width() - $(this.el).find('.sidebar').width() - 30,
            height: $('.tab_container').height() - 
                $(this.el).find('.workspace_toolbar').height() - 
                $(this.el).find('.workspace_fields').height() - 30
        });
    },
    
    toggle_sidebar: function() {
        // Toggle sidebar
        $(this.el).find('.sidebar').toggleClass('hide');
        var new_margin = $(this.el).find('.sidebar').hasClass('hide') ?
                5 : 265;
        $(this.el).find('.workspace_inner').css({ 'margin-left': new_margin });
    },
    
    flash_cube_navigation: function() {
        // Draw user's attention to cube navigation
        $(this.el).find('.cubes')
            .parent()
            .animate({ backgroundColor: '#AC1614' }, 'fast')
            .animate({ backgroundColor: '#fff' }, 'fast');
    },
    
    new_query: function() {
        // Delete the existing query
        if (this.query) {
            this.query.destroy();
        }
        
        // Initialize the new query
        var selected_cube = $(this.el).find('.cubes').val();
        this.query = new Query({ cube: selected_cube });
        this.query.workspace = this;
        
        // Create new DimensionList and MeasureList
        this.dimension_list = new DimensionList({
            workspace: this,
            dimension: Saiku.session.dimensions[selected_cube]
        });        
        $(this.el).find('.dimension_tree').html('').append($(this.dimension_list.el));
        
        this.measure_list = new DimensionList({
            workspace: this,
            dimension: Saiku.session.measures[selected_cube]
        });
        $(this.el).find('.measure_tree').html('').append($(this.measure_list.el));
        
        // Clear workspace
        this.clear();
        
        // Make sure appropriate workspace buttons are enabled
        this.trigger('query:new', { workspace: this });
    },
    
    remove_dimension: function(event, ui) {
        this.drop_zones.remove_dimension(event, ui);
    }
});
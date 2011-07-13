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
            .droppable();
        
        return this; 
    },
    
    clear: function() {
        // Prepare the workspace for a new query
        $(this.el).find('.workspace_results,.connectable')
            .html('');
    },
    
    initialize: function(args) {
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "adjust", "toggle_sidebar", 
                "flash_cube_navigation", "new_query");
        
        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar({ workspace: this });
        this.tab = args.tab;
        
        // Create drop zones
        this.drop_zones = new WorkspaceDropZone({ workspace: this });
        
        // Adjust tab when selected
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
        
        // Flash cube navigation when rendered
        this.tab.bind('tab_rendered', this.flash_cube_navigation);
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
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
        $(this.toolbar.el).find('.button').addClass('disabled_toolbar');
        $(this.toolbar.el).find('.auto,.non_empty,.toggle_fields')
            .removeClass('disabled_toolbar');
    },
    
    remove_dimension: function(event, ui) {
        this.drop_zones.remove_dimension(event, ui);
    }
});
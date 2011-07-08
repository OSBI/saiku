var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query'
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
        
        return this; 
    },
    
    clear: function() {
        // TODO - prepare the workspace for a new query
    },
    
    initialize: function(args) {
        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar;
        this.tab = args.tab;
        
        // Adjust tab when selected
        _.bindAll(this, "adjust", "toggle_sidebar");
        this.tab.bind('tab:select', this.adjust);
        $(window).resize(this.adjust);
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
    
    new_query: function() {
        // Delete the existing query
        if (this.query) {
            console.log('Deleting query');
            this.query.destroy();
        }
        
        // Initialize the new query
        var selected_cube = $(this.el).find('.cubes').val();
        this.query = new Query({ cube: selected_cube });
        
        // Create new DimensionList and MeasureList
        this.dimension_list = new DimensionList({
            template: Saiku.session.cubes[selected_cube].dimensions.template
        }).render();        
        $(this.el).find('.dimension_tree').html('').append($(this.dimension_list.el));
        
        this.measure_list = new DimensionList({
            template: Saiku.session.cubes[selected_cube].measures.template
        }).render(); 
        console.log(this.measure_list);
        $(this.el).find('.measure_tree').html('').append($(this.measure_list.el));
        
        // Clear workspace
        this.clear();
    }
});
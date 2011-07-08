var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar',
        'change .cubes': 'new_query'
    },
    
    template: function() {
        return Saiku.template.get('Workspace')({
            cubes: Saiku.session.cubes
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
        // Initialize the new query
        var selected_cube = $(this.el).find('.cubes').val();
        this.query = new Query({ cube: selected_cube });
        
        // Clear workspace
        this.clear();
    }
});
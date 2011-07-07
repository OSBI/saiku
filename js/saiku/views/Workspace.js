var WorkspaceToolbar = Backbone.View.extend({
    template: function() {
        return Saiku.template.get('WorkspaceToolbar')();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    }
});

var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggleSidebar'
    },
    
    template: function() {
        return Saiku.template.get('Workspace')();        
    },
    
    render: function() {
        // Load template
        $(this.el).html(this.template());
        
        // Generate toolbar
        this.toolbar.render();
        $(this.el).find('.workspace_toolbar').append($(this.toolbar.el));
        
        return this; 
    },
    
    initialize: function(args) {
        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar;
        this.tab = args.tab;
        
        // Adjust tab when selected
        _.bindAll(this, "adjust", "toggleSidebar");
        this.tab.bind('tab:select', this.adjust);
    },
    
    adjust: function() {
        // Adjust the height of the separator
        $separator = $(this.el).find('.sidebar_separator');
        $separator.height($("body").height() - 87);
    },
    
    toggleSidebar: function() {
        // Toggle sidebar
        $(this.el).find('.sidebar').toggleClass('hide');
        var new_margin = $(this.el).find('.sidebar').hasClass('hide') ?
                5 : 265;
        $(this.el).find('.workspace_inner').css({ 'margin-left': new_margin });
    }
});
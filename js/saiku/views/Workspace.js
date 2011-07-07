var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    template: function() {
        return Saiku.template.get('WorkspaceToolbar')();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    },
    
    call: function(args) {
        // Determine callback
        var callback = args.target.hash.replace('#', '');
        
        // Attempt to call callback
        try {
            this.enabled && this[callback](args);
        } catch (e) {
            console && 
                console.log('Workspace callback ' + callback + " does not exist");
        }
        
        return false;
    },
    
    save_query: function() {
        console.log('save');
    }
});

var Workspace = Backbone.View.extend({
    className: 'tab_container',
    
    events: {
        'click .sidebar_separator': 'toggle_sidebar'
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
    }
});
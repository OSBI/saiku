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
    
    initialize: function() {
        // Generate toolbar and append to workspace
        this.toolbar = new WorkspaceToolbar;
    }
});
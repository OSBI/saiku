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
        // TODO - save query
    }
});
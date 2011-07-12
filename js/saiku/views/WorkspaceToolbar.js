var WorkspaceToolbar = Backbone.View.extend({
    enabled: false,
    events: {
        'click a': 'call'
    },
    
    initialize: function(args) {
        this.workspace = args.workspace;
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
        try {
            ! $(event.target).hasClass('disabled_toolbar') && this[callback](args);
        } catch (e) {
            console && 
                console.log("Could not fire " + callback + ": " + e.message);
        }
        
        return false;
    },
    
    save_query: function() {
        // TODO - save query
    }
});
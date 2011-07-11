var WorkspaceDropZone = Backbone.View.extend({
    template: function() {
        return Saiku.template.get('WorkspaceDropZones')();
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        return this; 
    }
});
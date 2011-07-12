var WorkspaceDropZone = Backbone.View.extend({
    template: function() {
        return Saiku.template.get('WorkspaceDropZones')();
    },
    
    events: {
        'drop': 'select_dimension',
        'drag': 'move_dimension'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "select_dimension", "move_dimension");
    },
    
    render: function() {
        // Generate drop zones from template
        $(this.el).html(this.template());
        
        // Activate drop zones
        $(this.el).find('.connectable').droppable({
            accept: '.ui-draggable'
        });
        
        return this; 
    },
    
    select_dimension: function(event, ui) {
        // Make the element and its parent bold
        ui.draggable
            .css({fontWeight: "bold"});
        ui.draggable.parents('.parent_dimension')
            .find('.root')
            .css({fontWeight: "bold"});
        
        // Clone element and make draggable
        var $cloned_el = ui.draggable.clone(true);
        
        // Add the cloned element to the drop zone
        var $cloned_li = $("<li />").append($cloned_el)
            .appendTo($(event.target))
            .draggable({
                cancel: '.not-draggable, .hierarchy',
                opacity: 0.60,
                tolerance: 'pointer',
                cursorAt: {
                    top: 10,
                    left: 35
                }
            });
        if ($cloned_el.hasClass('dimension')) {
            $cloned_li.addClass('d_dimension');
        } else {
            $cloned_li.addClass('d_measure');
        }
        
        // Disable dragging on original element
        ui.draggable.draggable('disable');
    },
    
    move_dimension: function(event, ui) {
        
    }
});
var WorkspaceDropZone = Backbone.View.extend({
    template: function() {
        return Saiku.template.get('WorkspaceDropZones')();
    },
    
    events: {
        'drop': 'select_dimension',
        'click li': 'selections'
    },
    
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        
        // Maintain `this` in jQuery event handlers
        _.bindAll(this, "select_dimension", "move_dimension", 
                "remove_dimension");
    },
    
    render: function() {
        // Generate drop zones from template
        $(this.el).html(this.template());
        
        // Activate drop zones
        $(this.el).find('.connectable').droppable({
            accept: 'a.dimension, a.measure, .d_dimension, .d_measure'
        });
        
        return this; 
    },
    
    select_dimension: function(event, ui) {
        if (ui.draggable.hasClass('d_measure') 
                || ui.draggable.hasClass('d_dimension')) {
            this.move_dimension(event, ui);
            return;
        }
        
        // Make the element and its parent bold
        ui.draggable
            .css({fontWeight: "bold"});
        ui.draggable.parents('.parent_dimension')
            .find('.root')
            .css({fontWeight: "bold"});
        
        // Clone element and make draggable
        var $cloned_el = ui.draggable.clone()
            .draggable('destroy');
        
        // Add the cloned element to the drop zone
        var $cloned_li = $("<li />").append($cloned_el)
            .appendTo($(event.target))
            .draggable({
                helper: 'clone',
                connectToSortable: '.connectable, .sidebar',
                opacity: 0.60,
                tolerance: 'pointer',
                cursorAt: {
                    top: 10,
                    left: 35
                }
            });
        $cloned_li.data('original', ui.draggable);
        
        // Wrap with the appropriate parent element
        if ($cloned_el.hasClass('dimension')) {
            $cloned_li.addClass('d_dimension');
        } else {
            $cloned_li.addClass('d_measure');
        }
        
        // Disable dragging on original element
        ui.draggable.draggable('disable');
        
        // Prevent workspace from getting this event
        event.stopPropagation();
    },
    
    move_dimension: function(event, ui) {
        // Move the dimension
        ui.draggable.detach()
            .appendTo($(event.target));
        
        // Prevent workspace from getting this event
        event.stopPropagation();
    },
    
    remove_dimension: function(event, ui) {
        // Reenable original element
        ui.draggable.data('original')
            .draggable('enable')
            .css({ fontWeight: 'normal' });
        
        // Unhighlight the parent if applicable
        if (ui.draggable.data('original').parents('.parent_dimension')
                .children().children().children('.ui-state-disabled').length === 0) {
            ui.draggable.data('original').parents('.parent_dimension')
                .find('.root')
                .css({fontWeight: "normal"});
        }
        
        // Remove dimension
        ui.draggable.remove();
    },
    
    selections: function() {
        event.preventDefault();
        return false;
    }
});
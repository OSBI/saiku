var WorkspaceDropZone = Backbone.View.extend({
    template: function() {
        return Saiku.template.get('WorkspaceDropZones')();
    },
    
    events: {
        'sortstop': 'select_dimension',
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
        $(this.el).find('.connectable').sortable({
            connectWith: $(this.el).find('.connectable'),
            cursorAt: {
                top: 10,
                left: 35
            },
            forcePlaceholderSize: true,
            items: '> li',
            opacity: 0.60,
            placeholder: 'placeholder',
            tolerance: 'pointer',
        });
        
        return this; 
    },
    
    select_dimension: function(event, ui) {
        // Short circuit if this is a move
        if (ui.item.hasClass('d_measure') 
                || ui.item.hasClass('d_dimension')) {
            this.move_dimension(event, ui);
            return;
        }
        
        console.log('select');
        
        // Make the element and its parent bold
        var original_href = ui.item.find('a').attr('href');
        var $original = $(this.workspace.el).find('.sidebar')
            .find('a[href="' + original_href + '"]').parent('li');
        $original
            .css({fontWeight: "bold"})
            .draggable('disable');
        $original.parents('.parent_dimension')
            .find('.root')
            .css({fontWeight: "bold"});
        
        // Wrap with the appropriate parent element
        if (ui.item.find('a').hasClass('dimension')) {
            ui.item.addClass('d_dimension');
        } else {
            ui.item.addClass('d_measure');
        }
        
        // Notify the model of the change
        var dimension = ui.item.find('a').attr('href').replace('#', '');
        var index = ui.item.parent('.connectable').children().index(ui.item);
        this.workspace.query.move_dimension(dimension, index);
        
        // Prevent workspace from getting this event
        event.stopPropagation();
    },
    
    move_dimension: function(event, ui) {
        console.log('move');
        
        // Notify the model of the change
        var dimension = ui.item.find('a').attr('href').replace('#', '');
        var index = ui.item.parent('.connectable').children().index(ui.item);
        this.workspace.query.move_dimension(dimension, index);
        
        // Prevent workspace from getting this event
        event.stopPropagation();
    },
    
    remove_dimension: function(event, ui) {
        console.log('remove');
        // Reenable original element
        var original_href = ui.draggable.find('a').attr('href');
        var $original = $(this.workspace.el).find('.sidebar')
            .find('a[href="' + original_href + '"]').parent('li');
        $original
            .draggable('enable')
            .css({ fontWeight: 'normal' });
        
        // Unhighlight the parent if applicable
        if ($original.parents('.parent_dimension')
                .children().children('.ui-state-disabled').length === 0) {
            $original.parents('.parent_dimension')
                .find('.root')
                .css({fontWeight: "normal"});
        }
        
        // Remove element
        ui.draggable.remove();
        
        // Prevent workspace from getting this event
        event.stopPropagation();
    },
    
    selections: function(event, ui) {
        event.preventDefault();
        return false;
    }
});
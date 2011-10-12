/**
 * Controls the appearance and behavior of the dimension list
 * 
 * This is where drag and drop lives
 */
var DimensionList = Backbone.View.extend({
    events: {
        'click span': 'select',
        'click a': 'select'
    },
    
    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "render", "load_dimension");
        
        // Bind parent element
        this.workspace = args.workspace;
        this.dimension = args.dimension;
        
        // Fetch from the server if we haven't already
        if (args.dimension && args.dimension.has('template')) {
            this.load_dimension();
        } else if (! args.dimension){
            $(this.el).html('Could not load dimension. Please log out and log in again.');
        } else {
            $(this.el).html('Loading...');
            args.dimension.fetch({ success: this.load_dimension });
        }
    },
    
    load_dimension: function() {
        this.template = this.dimension.get('template');
        this.render(); 
        this.workspace.trigger('dimensions:loaded');

    },
    
    render: function() {
        // Pull the HTML from cache and hide all dimensions
        $(this.el).html(this.template)
            .find('.hide').hide().removeClass('hide');
        
        // Add draggable behavior
        $(this.el).find('.measure,.dimension').parent('li').draggable({
            cancel: '.not-draggable, .hierarchy',
            connectToSortable: $(this.workspace.el)
                .find('.columns > ul, .rows > ul, .filter > ul'),
            helper: 'clone',
            opacity: 0.60,
            tolerance: 'pointer',
            cursorAt: {
                top: 10,
                left: 35
            }
        });
    },
    
    select: function(event) {
        var $target = $(event.target).hasClass('root')
            ? $(event.target) : $(event.target).parent().find('span');
        if ($target.hasClass('root')) {
            $target.find('a').toggleClass('folder_collapsed').toggleClass('folder_expand');
            $target.toggleClass('collapsed').toggleClass('expand');
            $target.parents('li').find('ul').children('li').toggle();
        }
        
        return false;
    }
});
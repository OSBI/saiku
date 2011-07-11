/**
 * Controls the appearance and behavior of the dimension list
 * 
 * This is where drag and drop lives
 */
var DimensionList = Backbone.View.extend({
    events: {
        'click a': 'select'
    },
    
    initialize: function(args) {
        // Don't lose this
        _.bindAll(this, "render");
        
        // Bind parent element
        this.workspace = args.workspace;
        
        // Fetch from the server if we haven't already
        if (! args.dimension.has('template')) {
            args.dimension.fetch({ 
                success: function() {
                    this.template = args.dimension.get('template');
                    this.render(); 
                }    
            });
        } else {
            this.template = args.dimension.get('template');
            this.render();
        }
    },
    
    render: function() {
        // Pull the HTML from cache and hide all dimensions
        $(this.el).html(this.template)
            .find('.hide').hide().removeClass('hide');
        
        // Add draggable behavior
        $(this.el).find('.measure,.dimension').draggable({
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
        var $target = $(event.target);
        if ($target.parents('span').hasClass('root')) {
            $target.toggleClass('folder_collapsed').toggleClass('folder_expand');
            $target.parents('span').toggleClass('collapsed').toggleClass('expand');
            $target.parents('li').find('ul').children('li').toggle();
        }
        return false;
    }
});
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
        _.bindAll(this, "render");
        
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
        $(this.el).html(this.template)
            .find('.hide').hide().removeClass('hide');
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
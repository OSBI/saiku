var $target;
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
        $target = $(event.target);
        if ($target.parents('span').hasClass('root')) {
            $target.toggleClass('folder_collapsed').toggleClass('folder_expand');
            $target.parents('span').toggleClass('collapsed').toggleClass('expand');
            $target.parents('li').find('ul').children('li').toggle();
        }
        return false;
    }
});

var Dimension = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" 
            + args.key + "/dimensions";
    },
    
    parse: function(response) {
        this.set({
            template: Saiku.template.get('Dimensions')({
                dimensions: response
            })
        });
        
        return response;
    }
});

var Measure = Backbone.Model.extend({
    initialize: function(args) {
        this.url = Saiku.session.username + "/discover/" 
            + args.key + "/measures";
    },
    
    parse: function(response) {
        this.set({ 
            template: Saiku.template.get('Measures')({
                measures: response
            })
        });
        
        return response;
    }
});
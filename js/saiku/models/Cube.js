var $target;
var DimensionList = Backbone.View.extend({
    events: {
        'click a': 'select'
    },
    
    initialize: function(args) {
        $(this.el).html(args.template)
            .find('.hide').hide().removeClass('hide');
    },
    
    select: function(event) {
        $target = $(event.target);
        if ($target.parents('span').hasClass('root')) {
            $target.toggleClass('folder_collapse').toggleClass('folder_expand');
            $target.parents('span').toggleClass('collapse').toggleClass('expand');
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
        this.template = Saiku.template.get('Dimensions')({
            dimensions: response
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
        this.template = _.template("")({
            dimensions: response
        });
        
        return response;
    }
});

var Cube = Backbone.Model.extend({ 
    initialize: function(args) {
        this.key = args.key;
        this.dimensions = new Dimension({ key: this.key });
        this.measures = new Measure({ key: this.key });
    },
    
    fetch: function() {
        this.fetched = true;
        this.dimensions.fetch();
        this.measures.fetch();
    }
});
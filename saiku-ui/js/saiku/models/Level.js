var Level = Backbone.Model.extend({

    initialize: function(args, options) {
        if (options) {
            this.ui = options.ui;
            this.cube = options.cube;
            this.dimension = options.dimension;
            this.hierarchy = options.hierarchy;
        }
    },

    url: function() {
        return Saiku.session.username + '/discover/' + this.cube + '/dimensions/' + this.dimension + '/hierarchies/' + 
            this.hierarchy + '/levels';
    }
});

var LevelMember = Backbone.Model.extend({

    initialize: function(args, options) {
        if (options) {
            this.ui = options.ui;
            this.cube = options.cube;
            this.dimension = options.dimension;
            this.hierarchy = options.hierarchy;
            this.level = options.level;
        }
    },

    url: function() {
        return Saiku.session.username + '/discover/' + this.cube + '/dimensions/' + this.dimension + '/hierarchies/' + 
            this.hierarchy + '/levels/' + this.level;
    }
});

var LevelChildMember = Backbone.Model.extend({

    initialize: function(args, options) {
        if (options) {
            this.ui = options.ui;
            this.cube = options.cube;
            this.uniqueName = options.uniqueName;
        }
    },

    url: function() {
        return Saiku.session.username + '/discover/' + this.cube + '/member/' + encodeURIComponent(this.uniqueName) + '/children';
    }
});

var Result = Backbone.Model.extend({
    initialize: function(args, options) {
        // Keep reference to query
        this.query = options.query;
    },
    
    parse: function(response) {
        this.query.workspace.trigger('query:result', {
            workspace: this.query.workspace,
            data: response
        });
    },
    
    url: function() {
        // http://www.homestarrunner.com/vcr_cheat.html ?
        return this.query.url() + "/result/cheat";
    }
});
var Result = Backbone.Model.extend({
    initialize: function(args) {
        // Keep reference to query
        this.query = args.query;
        this.unset('query', { silent: true });
    },
    
    parse: function(response) {
        this.query.workspace.trigger('query_result', {
            workspace: this.query.workspace,
            data: response
        });
    },
    
    url: function() {
        // http://www.homestarrunner.com/vcr_cheat.html ?
        return this.query.url() + "/result/cheat";
    }
});
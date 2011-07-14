var Result = Backbone.Model.extend({
    initialize: function(args) {
        // Keep reference to query
        this.query = args.query;
        this.unset('query', { silent: true });
    },
    
    parse: function(response) {
        console.log('got a response');
        $(this.query.workspace.el).find('.workspace_results').html(JSON.stringify(response));
    },
    
    url: function() {
        // http://www.homestarrunner.com/vcr_cheat.html ?
        return this.query.url() + "/result/cheat";
    }
});
/**
 * Holds the resultset for a query, and notifies plugins when resultset updated
 */
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
        
        // Show the UI if hidden
        Saiku.ui.unblock();
    },
    
    url: function() {
        // http://www.homestarrunner.com/vcr_cheat.html ?
        return encodeURI(this.query.url() + "/result/cheat");
    }
});
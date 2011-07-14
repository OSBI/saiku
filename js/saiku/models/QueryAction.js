/**
 * Model which handles "special" actions against the query
 * Ex.: selections, swap axis, mdx
 */
var QueryAction = Backbone.Model.extend({
    initialize: function(args) {
        // Keep track of query
        this.query = args.query;
        this.unset('query', { silent: true });
        
        // Set default url
        this.url = this.query.url;
    },
    
    // Call arbitrary actions against the query
    handle: function(action, callback) {
        // Set query action
        this.url = this.query.url() + action;
        
        // Clear out old attributes
        this.attributes = {};
        
        // Handle response from server
        this.parse = callback;
        
        // Initiate action
        this.save();
    }
});
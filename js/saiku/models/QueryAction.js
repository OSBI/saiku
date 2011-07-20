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
    
    post: function(action, callback) {
        this.handle("save", action, callback);
    },
    
    del: function(action, callback) {
        this.id = _.uniqueId('queryaction_');
        this.handle("delete", action, callback);
        delete this.id;
    },
    
    // Call arbitrary actions against the query
    handle: function(method, action, callback) {
        // Set query action
        this.url = this.query.url() + escape(action);
        
        // Clear out old attributes
        this.attributes = {};
        
        // Initiate action
        if (method == "save") {
            // Handle response from server
            this.parse = callback;
            
            this.save();
        } else if (method == "delete") {
            this.destroy({ success: callback });
        }
    }
});
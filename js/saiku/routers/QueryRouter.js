/**
 * Router for opening query when session is initialized
 */
var QueryRouter = Backbone.Router.extend({
    routes: {
        'query/open/:query_name': 'open_query'
    },
    
    open_query: function(query_name) {
        Settings.ACTION = "OPEN_QUERY";
        var query = new SavedQuery({ name: query_name });
        query.fetch({ success: query.move_query_to_workspace });
    }
});

Saiku.routers.push(new QueryRouter());
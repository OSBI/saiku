/**
 * Router for opening query when session is initialized
 */
var QueryRouter = Backbone.Router.extend({
    routes: {
        'query/open/:query_name': 'open_query'
    },
    
    open_query: function(query_name) {
        Settings.ACTION = "OPEN_QUERY";
        var options = { 
            name: query_name,
            solution: Settings.GET.SOLUTION || "",
            path: Settings.GET.PATH || "",
            action: Settings.GET.ACTION || "",
            biplugin: true
        };
        var query = new SavedQuery(options);
        query.fetch({ success: query.move_query_to_workspace });
    }
});

Saiku.routers.push(new QueryRouter());
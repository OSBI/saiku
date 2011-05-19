/**
 * SaikuApp
 * Stores data for the application
 */
var SaikuApp = Backbone.Model.extend({
    defaults: {
        username: "",
        password: "",
        connections: {}
    },
    
    initialize: function() {
        // Generate a new tab set and add a tab
        this.set({
            tabs: new TabSet,
            session: (new Session).fetch()
        });
        this.get('tabs').add([new Tab]);
    }
});

/**
 * WorkspaceQuery
 * Handles query in the temporary workspace
 */
var WorkspaceQuery = Backbone.Model.extend({
    initialize: function(){
        this.set(id, util.generate_hash());
    },
    
    url: function() {
        return "/" + saiku.get('session').get("username") + "/query";
    }
});

/**
 * RepositoryQuery
 * Handles query which has been persisted to the repository
 */
var RepositoryQuery = Backbone.Model.extend({
    
});

/**
 * Tab
 * Handles state for a single tab
 */
var Tab = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, "render");
    },
    
    render: function() {}
});

/**
 * Keeps track of our tabs
 */
var TabSet = Backbone.Collection.extend({
    model: Tab
});

/**
 * Session
 * Handles authentication and connection information
 */
var Session = Backbone.Model.extend({
    url: function() {
        return "/" + saiku.get('session').get("username") + "/discover";
    },
    
    change: function() {
        
    }
});
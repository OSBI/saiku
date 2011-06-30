/**
 * Class which handles tab behavior
 * @param parent
 */
var Tab = Backbone.Model.extend({
    initialize: function(args) {
        _.extend(this, Backbone.Events);
        
        this._content = args.content ? args.content : new Workspace;
    }
});

/**
 * Collection for tabs
 */
var TabSet = Backbone.Collection.extend({
    model: Tab,
    
    select: function(tab) {
        
    }
});
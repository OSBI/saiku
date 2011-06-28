/**
 * Class which handles tab behavior
 * @param parent
 */
var Tab = Backbone.Model.extend({
    initialize: function() {
        _.extend(this, Backbone.Events);
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
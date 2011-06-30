/**
 * Class which handles tab behavior
 */
var Tab = Backbone.Model.extend({
    initialize: function(args) {
        _.extend(this, Backbone.Events);
        
        this._content = args.content ? args.content : new Workspace;
    },
    
    destroy: function() {
        // delete data
    }
});

/**
 * Class which controls the visual representation of the tabs
 */
var TabController = Backbone.View.extend({
    className: 'tabs',
    
    events: {
        'click a': 'select'
    },
    
    render: function() {
        $(this.el).html('<ul></ul>')
            .appendTo($('#header'));
        $('<div id="tab_panel">').appendTo($('body'));
        return this;
    },
    
    select: function() {
        
    }
});

/**
 * Collection for tabs
 */
var TabSet = Backbone.Collection.extend({
    model: Tab,
    
    initialize: function() {
        _.extend(this, Backbone.View);
        
        this.bind('add', this.onAdd);
        this.bind('remove', this.onRemove);
    },
    
    render: function() {
        this._controller = new TabController;
        this._controller.render();
    },
    
    onAdd: function(tab) {
        //$('#tab_panel').tabs('add', _.uniqueId('#query-'), 'Unsaved query');
        //tab.index = $(this.el).tabs('length');
    },
    
    onRemove: function(tab) {
        //tab.destroy();
        //$('#tab_panel').tabs('remove', tab.index);
    }
});
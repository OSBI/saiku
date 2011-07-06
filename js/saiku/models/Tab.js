/**
 * Class which handles tab behavior
 */
var Tab = Backbone.View.extend({
    tagName: 'li',
    events: {
        'click a': 'select',
        'click span': 'remove'
    },
    
    template: function() {
        return _.template("<a href='#<%= id %>'>New Query</a>" +
                "<span class='close_tab'>Close tab</span>")
            ({
                id: this.id
            });
    },
    
    initialize: function(args) {
        _.extend(this, Backbone.Events);
        
        this.content = args && args.content ? args.content : new Workspace;
        this.id = _.uniqueId('tab_');
    },
    
    render: function() {
        // Render the content
        this.content.render();
        
        // Generate the element
        $(this.el).html(this.template());
        
        return this;
    },
    
    destroy: function() {
        // delete data
    },
    
    /**
     * Select a tab
     * @param el
     */
    select: function() {
        // Deselect all tabs
        this.parent.select(this);
        
        // Select the selected tab
        $(this.el).addClass('selected');
        
        return false;
    },
    
    remove: function() {
        // Remove the tab element
        $(this.el).remove();
        
        // Remove the tab
        this.destroy();
        
        // Remote the tab object from the container
        this.parent.remove(this);
        
        return false;
    }
});

/**
 * Class which controls the visual representation of the tabs
 */
var TabSet = Backbone.View.extend({
    className: 'tabs',
    _tabs: [],
    
    render: function() {
        $(this.el).html('<ul></ul>')
            .appendTo($('#header'));
        this.content = $('<div id="tab_panel">').appendTo($('body'));
        return this;
    },
    
    /**
     * Add a tab
     * @param tab
     */
    add: function(tab) {
        // Add it to the set
        this._tabs.push(tab);
        tab.parent = this;
        
        // Render it in the background, then select it
        tab.render().select();
        $(tab.el).appendTo($(this.el).find('ul'));
    },
    
    select: function(tab) {
        // Clear selections
        $(this.el).find('li').removeClass('selected');
        
        // Replace the contents of the tab panel with the new content
        this.content.children().detach();
        this.content.append(tab.content.el);
    },
    
    remove: function(tab) {
        for (var i = 0; i < this._tabs.length; i++) {
            if (this._tabs[i] == tab) {
                // Remove the element
                this._tabs.splice(i, 1);
                
                // Add another tab if the last one has been deleted
                if (this._tabs.length == 0) {
                    this.add(new Tab);
                }
                
                // Select the previous, or first tab
                var next = this._tabs[i] ? i : 0;
                this._tabs[next].select();
            }
        }
    }
});
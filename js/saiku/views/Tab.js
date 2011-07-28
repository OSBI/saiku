/**
 * Class which handles individual tabs
 */
var Tab = Backbone.View.extend({
    tagName: 'li',
    
    events: {
        'click a': 'select',
        'mousedown a': 'remove',
        'click .close_tab': 'remove'
    },
    
    template: function() {
        // Generate caption
        var caption = '';
        if (this.content && this.content.query && this.content.query.name) {
            caption = this.content.query.name;
        } else {
            caption = "Unsaved query (" + this.parent.queryCount + ")";
        }
        
        // Create tab
        return _.template("<a href='#<%= id %>'><%= caption %></a>" +
                "<span class='close_tab'>Close tab</span>")
            ({
                id: this.id,
                caption: caption
            });
    },
    
    /**
     * Assign a unique ID and assign a Backbone view 
     * to handle the tab's contents
     * @param args
     */
    initialize: function(args) {
        _.extend(this, Backbone.Events);
        
        this.content = new Workspace({ tab: this });
        this.id = _.uniqueId('tab_');
    },
    
    /**
     * Render the tab and its contents
     * @returns tab
     */
    render: function() {
        // Render the content
        this.content.render();
        
        // Generate the element
        $(this.el).html(this.template());
        
        return this;
    },
    
    /**
     * Destroy any data associated with this tab and ensure proper
     * garbage collection to avoid memory leaks
     */
    destroy: function() {
        // Delete data
        this.content && this.content.query && this.content.query.destroy();
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
        
        // Trigger select event
        this.trigger('tab:select');
        
        return false;
    },
    
    /**
     * Remove a tab
     * @returns {Boolean}
     */
    remove: function(event) {
        if (!event || event.which === 2 || $(event.target).hasClass('close_tab')) {
            // Remove the tab element
            $(this.el).remove();
            
            // Remove the tab
            this.destroy();
            
            // Remote the tab object from the container
            this.parent.remove(this);
        }
        
        return false;
    }
});

/**
 * Class which controls the tab collection
 */
var TabSet = Backbone.View.extend({
    className: 'tabs',
    queryCount: 0,
    
    _tabs: [],
    
    /**
     * Render the tab containers
     * @returns tab_container
     */
    render: function() {
        $(this.el).html('<ul></ul>')
            .appendTo($('#header'));
        this.content = $('<div id="tab_panel">').appendTo($('body'));
        return this;
    },
    
    /**
     * Add a tab to the collection
     * @param tab
     */
    add: function(tab) {
        // Add it to the set
        this._tabs.push(tab);
        this.queryCount++;
        tab.parent = this;
        
        // Render it in the background, then select it
        tab.render().select();
        $(tab.el).appendTo($(this.el).find('ul'));
        
        // Trigger 'render' event
        tab.trigger('tab:rendered', { tab: tab });
        
        // Trigger add event on session
        Saiku.session.trigger('tab:add', { tab: tab });
    },
    
    /**
     * Select a tab, and move its contents to the tab panel
     * @param tab
     */
    select: function(tab) {
        // Clear selections
        $(this.el).find('li').removeClass('selected');
        
        // Replace the contents of the tab panel with the new content
        this.content.children().detach();
        this.content.append($(tab.content.el));
    },
    
    /**
     * Remove a tab from the collection
     * @param tab
     */
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
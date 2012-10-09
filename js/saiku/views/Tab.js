/*  
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

 
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
        // Create tab
        return _.template("<a href='#<%= id %>'><%= caption %></a>" +
                "<span class='close_tab sprite'>Close tab</span>")
            ({
                id: this.id,
                caption: this.caption
            });
    },
    
    /**
     * Assign a unique ID and assign a Backbone view 
     * to handle the tab's contents
     * @param args
     */
    initialize: function(args) {
        _.extend(this, Backbone.Events);
        _.extend(this, args);
        this.content.tab = this;
        this.caption = this.content.caption();
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
        if (this.content && this.content.query) {
            this.content.query.destroy();
        }
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
            // Remote the tab object from the container
            this.parent.remove(this);

            try {
                // Remove the tab element
                $(this.el).remove();
                
                // Remove the tab                
                this.destroy();
            } catch (e) {
                Log.log(JSON.stringify({
                    Message: "Tab could not be removed",
                    Tab: JSON.stringify(this)
                }));
            }
        }
   
        return false;
    }
});

/**
 * Class which controls tab pager
 */
var TabPager = Backbone.View.extend({
    className: 'pager_contents',
    events: {
        'click a': 'select'
    },
    
    initialize: function(args) {
        this.tabset = args.tabset;
        $(this.el).hide().appendTo('body');
        
        // Hide when focus is lost
        $(window).click(function(event) {
            if (! $(event.target).hasClass('pager_contents')) {
                $('.pager_contents').hide();
            }
        });
    },
    
    render: function() {
        var pager = "";
        for (var i = 0; i < this.tabset._tabs.length; i++) {
            pager += "<a href='#" + i + "'>" + 
                this.tabset._tabs[i].caption + "</a><br />";
        }
        $(this.el).html(pager);
    },
    
    select: function(event) {
        var index = $(event.target).attr('href').replace('#', '');
        this.tabset._tabs[index].select();
        $(this.el).hide();
        event.preventDefault();
        return false;
    }
});

/**
 * Class which controls the tab collection
 */
var TabSet = Backbone.View.extend({
    className: 'tabs',
    queryCount: 0,
    
    events: { 'click a.pager': 'togglePager' },
    
    _tabs: [],
    
    /**
     * Render the tab containers
     * @returns tab_container
     */
    render: function() {
        $(this.el).html('<a href="#pager" class="pager sprite"></a><ul></ul>')
            .appendTo($('#header'));
        this.content = $('<div id="tab_panel">').appendTo($('body'));
        this.pager = new TabPager({ tabset: this });
        return this;
    },
    
    /**
     * Add a tab to the collection
     * @param tab
     */
    add: function(content) {
        // Add it to the set
        var tab = new Tab({ content: content });
        this._tabs.push(tab);
        this.queryCount++;
        tab.parent = this;
        
        // Render it in the background, then select it
        tab.render().select();
        $(tab.el).appendTo($(this.el).find('ul'));
        
        // Trigger add event on session
        Saiku.session.trigger('tab:add', { tab: tab });
        this.pager.render();
        
        return tab;
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
        // Add another tab if the last one has been deleted
        if (this._tabs.length == 1) {
            this.add(new Workspace());
        }
        
        for (var i = 0; i < this._tabs.length; i++) {
            if (this._tabs[i] == tab) {
                // Remove the element
                this._tabs.splice(i, 1);
                Saiku.session.trigger('tab:remove', { tab: tab });
                this.pager.render();
                
                // Select the previous, or first tab
                var next = this._tabs[i] ? i : (this._tabs.length - 1);
                this._tabs[next].select();
            }
        }
        
        return true;
    },
    
    togglePager: function() {
        $(this.pager.el).toggle();
        return false;
    }
});

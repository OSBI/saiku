/*
 * TabTest.js
 * 
 * Copyright (c) 2011, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
module('Tab', {
    setup: function() {
        var workspace = new Workspace();
        this.tab = new Tab({ content: workspace });
    }
});

test('event handler', function event_handler() {
    var global_value = false;
    this.tab.bind('zero', function() {
        global_value = true;
    });
    
    this.tab.trigger('zero');
    equal(true, global_value, 'Could not bind event listener');
});

test('multiple event handlers', function multiple_handlers() {
    var global_value = 0;
    
    this.tab.bind('multiple', function() {
        global_value+=1;
    });
    
    this.tab.bind('multiple', function() {
        global_value+=1;
    });
    
    this.tab.bind('multiple', function() {
        global_value+=1;
    });
    
    this.tab.trigger('multiple');
    equal(3, global_value, 'Could not bind multiple event listeners');
});

test('tab render', function tab_render() {
    this.tab.render();
    notStrictEqual(-1, $(this.tab.el).html().indexOf('Unsaved query'));
    strictEqual(-1, $(this.tab.el).html().indexOf('Unsaved Query (1)'));
});

test('tab properties', function tab_properties() {
    notEqual(this.tab.caption, "");
    notStrictEqual(this.tab.id, undefined);
    equal(this.tab.id, this.tab.content.tab.id);
    notStrictEqual(undefined, this.tab.bind);
    notStrictEqual(undefined, this.tab.trigger);
});

module('TabSet', {
    setup: function() {
        this.tabset = new TabSet();
    },
    
    teardown: function() {
        $("#tab_panel").remove();
    }
});

test('initial conditions', function initial_conditions() {
    equal(this.tabset.queryCount, 0);
    equal(undefined, this.tabset.pager);
    this.tabset.render();
    ok(this.tabset.pager !== undefined);
    ok(this.tabset.content !== undefined);
    notEqual(-1, $(this.tabset.el).html().indexOf('#pager'));
});

test('tab lifecycle', function add_tab() {
    // Add tab
    this.tabset.render();
    raises(this.tabset.add, TypeError, 
        "Don't allow tab instantiation without Backbone view as parameter");
    var tab = this.tabset.add(new Workspace());
    ok(this.tabset === tab.parent, 
        "Should set parent property when creating tab");
    equal(1, this.tabset.queryCount,
        "Query count should be incremented");
    equal(this.tabset.queryCount, this.tabset._tabs.length,
        "Because no tabs have been removed, query count and tab length should match");
    var tab2 = this.tabset.add(new Workspace());
    equal(2, this.tabset.queryCount,
        "Query count should be incremented");
    
    // Select tab
    this.tabset.select(tab);
    this.tabset.select(tab2);
    
    // Remove tab
    this.tabset.remove(tab);
    equal(2, this.tabset.queryCount,
        "Query count should not decrement");
    notEqual(this.tabset.queryCount, this.tabset._tabs.length,
        "Query count should not equal tab length");
    this.tabset.remove(tab2);
    equal(1, this.tabset._tabs.length,
        "Tabset should add a tab when empty");
});

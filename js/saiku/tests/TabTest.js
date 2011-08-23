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
    strictEqual(-1, $(this.tab.el).html().indexOf('Unsaved Query'));
});

test('tab properties', function tab_properties() {
    notEqual(this.tab.caption, "");
    notStrictEqual(this.tab.id, undefined);
    equal(this.tab.id, this.tab.content.tab.id);
    notStrictEqual(undefined, this.bind);
    notStrictEqual(undefined, this.trigger);
});
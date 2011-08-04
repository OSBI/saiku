module('Tab', {
    setup: function() {
        console.log("Loaded");
        try {
        var workspace = new Workspace();
        this.tab = new Tab({ content: workspace });
        } catch (e) { console.log("ERROR", e); }
    }
});

test('event handler', function() {
    var global_value = false;
    this.tab.bind('zero', function() {
        global_value = true;
    });
    
    this.tab.trigger('zero');
    equal(true, global_value, 'Could not bind event listener');
});

test('multiple event handlers', function() {
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

test('getters and setters', function() {
    this.tab.set({ foo: 2 });
    equal(this.tab.get('foo'), 2);
});
var tab;

module('Tab', {
    setup: function() {
        tab = new Tab();
    }
});

test('event handler', function() {
    var global_value = false;
    tab.bind('zero', function() {
        global_value = true;
    });
    
    tab.trigger('zero');
    equal(true, global_value, 'Could not bind event listener');
    delete global_value;
});

test('multiple event handlers', function() {
    var global_value = 0;
    
    tab.bind('multiple', function() {
        global_value+=1;
    });
    
    tab.bind('multiple', function() {
        global_value+=1;
    });
    
    tab.bind('multiple', function() {
        global_value+=1;
    });
    
    tab.trigger('multiple');
    equal(3, global_value, 'Could not bind multiple event listeners');
    delete global_value;
});

test('getters and setters', function() {
    tab.set({ foo: 2 });
    equal(tab.get('foo'), 2);
});
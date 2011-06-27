var controller;

module('Controller', {
    setup: function() {
        controller = new Controller();
    }
});

test('event handler', function() {
    var global_value = false;
    controller.listen('zero', function() {
        global_value = true;
    });
    
    controller.trigger('zero');
    equal(true, global_value, 'Could not bind event listener');
    delete global_value;
});

test('multiple event handlers', function() {
    var global_value = 0;
    
    controller.listen('multiple', function() {
        global_value+=1;
    });
    
    controller.listen('multiple', function() {
        global_value+=1;
    });
    
    controller.listen('multiple', function() {
        global_value+=1;
    });
    
    controller.trigger('multiple');
    equal(3, global_value, 'Could not bind multiple event listeners');
    delete global_value;
});

test('trigger bad event handler', function() {
    raises(function() {
        controller.trigger('wonky_event_handler');
    }, BadEventException);
});

test('getters and setters', function() {
    controller.set('foo', 2);
    equal(controller.get('foo'), 2);
});

test('data_validators', function() {
    controller.listen('pre_set_foo', function(data) {
        return data + 2;
    });
    
    controller.set('foo', 2);
    equal(controller.get('foo'), 4);
});
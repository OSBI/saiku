/**
 * Class which handles running and displaying tests
 */
var TestRunner = Backbone.View.extend({
    template: function() {
        return '<h1 id="qunit-header">QUnit Test Suite</h1>' + 
               '<h2 id="qunit-banner"></h2>' +
               '<div id="qunit-testrunner-toolbar"></div>' +
               '<h2 id="qunit-userAgent"></h2>' +
               '<ol id="qunit-tests"></ol>';
    },
    
    caption: function() {
        return "Test runner";
    },
    
    render: function() {
        $(this.el).html(this.template());
        
        this.run();
    },
    
    run: function() {
        // Load test cases
        $.getScript("js/saiku/tests/TabTest.js");
    }
});

function run_tests() {
    // Load QUnit and initialize test runner screen
    $.getScript("js/jquery/qunit.js", function() {
        Saiku.tabs.add(new TestRunner());
    });
    
    // Load CSS
    $('head').append('<link rel="stylesheet" href="js/jquery/qunit.css" type="text/css" media="screen">');
}